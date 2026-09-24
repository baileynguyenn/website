"""Seed the products collection. Idempotent: wipes and re-inserts. Run: python seed.py"""
import asyncio
from datetime import datetime, timedelta, timezone

from lib.db import db, ensure_indexes
from catalog_data import PRODUCTS


async def main():
    await db.products.delete_many({})
    base = datetime.now(timezone.utc)
    docs = []
    for i, p in enumerate(PRODUCTS):
        docs.append({**p, "created_at": base - timedelta(days=len(PRODUCTS) - i)})
    await db.products.insert_many(docs)
    await ensure_indexes()
    print(f"Seeded {len(docs)} products.")


if __name__ == "__main__":
    asyncio.run(main())
