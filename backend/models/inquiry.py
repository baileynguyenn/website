from datetime import datetime, timezone
from typing import Annotated, Literal, Optional
import uuid

from pydantic import AliasChoices, BaseModel, BeforeValidator, ConfigDict, Field, field_validator

PyObjectId = Annotated[str, BeforeValidator(str)]
InquiryStatus = Literal["new", "contacted", "closed"]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: PyObjectId = Field(
        default_factory=lambda: str(uuid.uuid4()),
        alias="_id", validation_alias=AliasChoices("id", "_id"), serialization_alias="id",
    )

    def to_mongo(self) -> dict:
        document = self.model_dump()
        document["_id"] = self.id
        return document

    @classmethod
    def from_mongo(cls, document: dict):
        return cls.model_validate(document)


class ContactInquiryCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=8, max_length=20)
    email: Optional[str] = Field(default=None, max_length=160)
    category_interest: Optional[str] = Field(default=None, max_length=120)
    message: Optional[str] = Field(default=None, max_length=2000)


class ContactInquiry(BaseDocument, ContactInquiryCreate):
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: InquiryStatus = "new"
    updated_at: Optional[datetime] = None

    @field_validator("created_at", "updated_at", mode="after")
    @classmethod
    def ensure_utc(cls, value):
        if value is not None and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value


class InquiryListResponse(BaseModel):
    items: list[ContactInquiry]
    total: int
    page: int
    page_size: int


class InquiryStatusUpdate(BaseModel):
    status: InquiryStatus
