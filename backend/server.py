import asyncio
import re
import os
import uuid
import logging
import unicodedata
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional

import bcrypt
import jwt
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Depends, Query
from pydantic import BaseModel, Field
from pymongo import ReturnDocument
from starlette.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from lib.db import client, db, ensure_indexes
from catalog_data import CATEGORIES
from models.inquiry import (
    ContactInquiryCreate, ContactInquiry, InquiryListResponse, InquiryStatus, InquiryStatusUpdate,
)

JWT_ALGORITHM = "HS256"
TOKEN_MAX_AGE = 12 * 3600

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "minhlam"
_storage_key: Optional[str] = None


def init_storage(force: bool = False) -> str:
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(
        f"{STORAGE_URL}/init",
        json={"emergent_key": os.environ.get("EMERGENT_LLM_KEY")},
        timeout=30,
    )
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": init_storage(), "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple[bytes, str]:
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": init_storage()},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(email: str) -> str:
    payload = {
        "sub": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(seconds=TOKEN_MAX_AGE),
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


async def seed_admin() -> None:
    email = os.environ["ADMIN_EMAIL"].strip().lower()
    password = os.environ["ADMIN_PASSWORD"]
    existing = await db.admins.find_one({"email": email})
    if existing is None:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_password(password),
            "created_at": datetime.now(timezone.utc),
        })
        logger.info("Seeded admin %s", email)
    elif not verify_password(password, existing["password_hash"]):
        await db.admins.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})
        logger.info("Updated admin password for %s", email)


def google_admin_emails() -> set:
    raw = os.environ.get("GOOGLE_ADMIN_EMAILS", "")
    return {e.strip().lower() for e in raw.split(",") if e.strip()}


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if token:
        try:
            payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
            admin = await db.admins.find_one({"email": payload["sub"]}, {"_id": 0, "password_hash": 0})
            if admin:
                return admin
        except jwt.PyJWTError:
            pass
    session_token = request.cookies.get("session_token")
    if session_token:
        session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if session:
            expires_at = session["expires_at"]
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at >= datetime.now(timezone.utc):
                user = await db.google_users.find_one({"user_id": session["user_id"]}, {"_id": 0})
                if user and user["email"].lower() in google_admin_emails():
                    return {"email": user["email"], "name": user.get("name", "Quản trị Minh Lâm")}
    raise HTTPException(status_code=401, detail="Chưa đăng nhập hoặc phiên đã hết hạn")


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())
    try:
        await seed_admin()
    except Exception as exc:
        logger.error("seed_admin failed: %s", exc)
    try:
        await asyncio.to_thread(init_storage)
        logger.info("Object storage initialized")
    except Exception as exc:
        logger.error("Storage init failed: %s", exc)
    yield
    client.close()


app = FastAPI(title="Nội Thất Minh Lâm API", lifespan=lifespan)
api_router = APIRouter(prefix="/api")


class Product(BaseModel):
    id: str
    name: str
    category: str
    price: int
    price_display: str
    wood_type: str
    dimensions: str
    description: str
    badge: str = ""
    featured: bool = False
    images: List[str] = []
    created_at: Optional[datetime] = None


class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    category: str = Field(min_length=2, max_length=60)
    price: int = Field(ge=0)
    price_display: str = ""
    wood_type: str = Field(default="", max_length=200)
    dimensions: str = Field(default="", max_length=200)
    description: str = Field(default="", max_length=2000)
    badge: str = Field(default="", max_length=40)
    featured: bool = False
    images: List[str] = []


class ProductListResponse(BaseModel):
    items: List[Product]
    total: int


class CategoryInfo(BaseModel):
    slug: str
    name: str
    description: str
    image: str
    count: int = 0


class LoginRequest(BaseModel):
    email: str
    password: str


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return text or "san-pham"


def with_price_display(doc: dict) -> dict:
    if not doc.get("price_display"):
        doc["price_display"] = f"{doc['price']:,}".replace(",", ".") + " ₫"
    return doc


# ---------- Public catalog ----------

@api_router.get("/")
async def root():
    return {"message": "Nội Thất Minh Lâm API"}


@api_router.get("/categories", response_model=List[CategoryInfo])
async def get_categories():
    grouped = await db.products.aggregate(
        [{"$group": {"_id": "$category", "count": {"$sum": 1}}}]
    ).to_list(100)
    count_map = {g["_id"]: g["count"] for g in grouped}
    return [CategoryInfo(**c, count=count_map.get(c["slug"], 0)) for c in CATEGORIES]


@api_router.get("/products", response_model=ProductListResponse)
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "newest",
    featured: Optional[bool] = None,
):
    query: dict = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if search and search.strip():
        rx = {"$regex": re.escape(search.strip()), "$options": "i"}
        query["$or"] = [{"name": rx}, {"wood_type": rx}, {"description": rx}]
    sort_spec = [("created_at", -1)]
    if sort == "price-asc":
        sort_spec = [("price", 1)]
    elif sort == "price-desc":
        sort_spec = [("price", -1)]
    docs = await db.products.find(query, {"_id": 0}).sort(sort_spec).to_list(500)
    return ProductListResponse(items=[Product(**d) for d in docs], total=len(docs))


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    doc = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
    return Product(**doc)


@api_router.post("/contact", response_model=ContactInquiry, status_code=201)
async def create_inquiry(payload: ContactInquiryCreate):
    inquiry = ContactInquiry(**payload.model_dump())
    await db.inquiries.insert_one(inquiry.to_mongo())
    return inquiry


# ---------- Files (object storage) ----------

@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, content_type = await asyncio.to_thread(get_object, path)
    except requests.HTTPError as exc:
        if exc.response is not None and exc.response.status_code == 404:
            raise HTTPException(status_code=404, detail="File not found")
        raise HTTPException(status_code=502, detail="Storage unavailable")
    return Response(
        content=data,
        media_type=record.get("content_type") or content_type,
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


# ---------- Admin auth ----------

@api_router.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.strip().lower()
    admin = await db.admins.find_one({"email": email})
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
    response.set_cookie(
        "access_token",
        create_access_token(email),
        httponly=True,
        secure=True,
        samesite="none",
        max_age=TOKEN_MAX_AGE,
        path="/",
    )
    return {"email": email, "name": "Quản trị Minh Lâm"}


class GoogleSessionRequest(BaseModel):
    session_id: str


@api_router.post("/auth/google/session")
async def google_session(payload: GoogleSessionRequest, response: Response):
    def fetch_session() -> dict:
        resp = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": payload.session_id},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()

    try:
        data = await asyncio.to_thread(fetch_session)
    except Exception:
        raise HTTPException(status_code=401, detail="Phiên Google không hợp lệ hoặc đã hết hạn")

    email = data["email"].strip().lower()
    if email not in google_admin_emails():
        raise HTTPException(status_code=403, detail="Tài khoản Google này chưa được cấp quyền quản trị")

    user = await db.google_users.find_one({"email": email}, {"_id": 0})
    if not user:
        user = {
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": email,
            "name": data.get("name", email),
            "picture": data.get("picture", ""),
            "created_at": datetime.now(timezone.utc),
        }
        await db.google_users.insert_one(user)
    await db.user_sessions.delete_many({"user_id": user["user_id"]})
    session_token = data["session_token"]
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })
    response.set_cookie(
        "session_token",
        session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 3600,
        path="/",
    )
    return {"email": email, "name": user["name"], "picture": user.get("picture", "")}


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def auth_me(admin: dict = Depends(get_current_admin)):
    return admin


# ---------- Admin inquiries ----------

@api_router.get("/admin/inquiries", response_model=InquiryListResponse)
async def list_inquiries(
    response: Response,
    admin: dict = Depends(get_current_admin),
    status: Optional[InquiryStatus] = None,
    search: str = Query(default="", max_length=120),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    response.headers["Cache-Control"] = "no-store"
    query: dict = {}
    if status == "new":
        query["$or"] = [{"status": "new"}, {"status": {"$exists": False}}]
    elif status:
        query["status"] = status
    if search.strip():
        rx = {"$regex": re.escape(search.strip()), "$options": "i"}
        query["$and"] = [{"$or": [{field: rx} for field in ("full_name", "phone", "email", "message")]}]
    total = await db.inquiries.count_documents(query)
    docs = await db.inquiries.find(query).sort([("created_at", -1), ("id", -1)]).skip(
        (page - 1) * page_size
    ).limit(page_size).to_list(page_size)
    return InquiryListResponse(
        items=[ContactInquiry.from_mongo(doc) for doc in docs],
        total=total, page=page, page_size=page_size,
    )


@api_router.patch("/admin/inquiries/{inquiry_id}", response_model=ContactInquiry)
async def update_inquiry_status(
    inquiry_id: str, payload: InquiryStatusUpdate, response: Response,
    admin: dict = Depends(get_current_admin),
):
    response.headers["Cache-Control"] = "no-store"
    doc = await db.inquiries.find_one_and_update(
        {"id": inquiry_id},
        {"$set": {"status": payload.status, "updated_at": datetime.now(timezone.utc)}},
        return_document=ReturnDocument.AFTER,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy yêu cầu tư vấn")
    return ContactInquiry.from_mongo(doc)


# ---------- Admin product management ----------

@api_router.post("/admin/products", response_model=Product, status_code=201)
async def create_product(payload: ProductIn, admin: dict = Depends(get_current_admin)):
    base = f"ml-{slugify(payload.name)}"
    product_id = base
    n = 1
    while await db.products.find_one({"id": product_id}):
        n += 1
        product_id = f"{base}-{n}"
    doc = with_price_display(payload.model_dump())
    doc.update({"id": product_id, "created_at": datetime.now(timezone.utc)})
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return Product(**doc)


@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, payload: ProductIn, admin: dict = Depends(get_current_admin)):
    doc = with_price_display(payload.model_dump())
    result = await db.products.find_one_and_update(
        {"id": product_id},
        {"$set": doc},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
    result.pop("_id", None)
    return Product(**result)


@api_router.delete("/admin/products/{product_id}", status_code=204)
async def delete_product(product_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")


@api_router.post("/admin/upload", status_code=201)
async def admin_upload(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận tệp hình ảnh (jpg, png, webp…)")
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Ảnh tối đa 8MB")
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "jpg"
    path = f"{APP_NAME}/products/{uuid.uuid4().hex}.{ext}"
    try:
        result = await asyncio.to_thread(put_object, path, data, file.content_type or "image/jpeg")
    except Exception as exc:
        logger.error("upload failed: %s", exc)
        raise HTTPException(status_code=502, detail="Tải ảnh lên thất bại, thử lại sau")
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc),
    })
    return {"path": result["path"], "url": f"/api/files/{result['path']}"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
