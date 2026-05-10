#!/usr/bin/env python3
"""Ingest Toronto Open Data Affordable Rental Housing dataset into the listings table."""

import os
import logging
import requests
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://homebase:homebase@localhost:5432/homebase")
TORONTO_RESOURCE_ID = "6ef13f8d-f8c8-4f2a-ba84-5f21c8b56bae"
API_URL = f"https://ckan0.cf.opendata.inter.toronto.ca/api/3/action/datastore_search"


NEIGHBOURHOOD_COORDS: dict[str, tuple[float, float]] = {
    "Scarborough": (43.7731, -79.2569),
    "North York": (43.7615, -79.4111),
    "Etobicoke": (43.6205, -79.5132),
    "East York": (43.6962, -79.3282),
    "York": (43.6889, -79.4680),
    "Downtown": (43.6532, -79.3832),
    "Midtown": (43.6969, -79.3956),
    "Annex": (43.6700, -79.4100),
}

BEDROOM_PRICES = {0: 1400, 1: 1900, 2: 2500, 3: 3100, 4: 3700}


def price_for_bedrooms(bedrooms: int) -> int:
    return BEDROOM_PRICES.get(bedrooms, BEDROOM_PRICES[1]) + (hash(str(bedrooms)) % 300 - 150)


def fetch_records(limit: int = 500) -> list[dict]:
    params = {"resource_id": TORONTO_RESOURCE_ID, "limit": limit}
    try:
        resp = requests.get(API_URL, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data.get("result", {}).get("records", [])
    except requests.RequestException as exc:
        log.error("Failed to fetch Toronto data: %s", exc)
        return []


def transform(record: dict) -> dict | None:
    name = record.get("PROPERTY_NAME") or record.get("BUILDING_NAME")
    if not name:
        return None

    ward = record.get("WARD_NAME") or record.get("WARD") or "Toronto"
    # Map ward names to standard neighbourhoods
    neighbourhood = ward.split("(")[0].strip() if ward else "Toronto"
    bedrooms = 1
    try:
        units = int(record.get("CONFIRMED_UNITS", 0) or 0)
        bedrooms = max(0, min(4, units // 20))
    except (ValueError, TypeError):
        pass

    lat, lon = NEIGHBOURHOOD_COORDS.get(neighbourhood, (43.6532, -79.3832))
    # Add small jitter so listings don't stack
    import random
    lat += random.uniform(-0.02, 0.02)
    lon += random.uniform(-0.02, 0.02)

    address = record.get("SITE_ADDRESS") or ""
    provider = record.get("HOUSING_PROVIDER") or ""
    description = (
        f"Affordable rental housing managed by {provider}. "
        f"Located in {neighbourhood}, Toronto. "
        f"{record.get('CONFIRMED_UNITS', '')} confirmed units in the building."
    ).strip()

    ext_id = str(record.get("_id", ""))
    # Rotate through a set of real housing photos from Pexels CDN (no API key needed)
    housing_photos = [
        "1571460", "2079249", "1648776", "106399", "1643383",
        "271816", "1668928", "276724", "2121121", "1457842",
        "2635038", "280232", "323780", "1080721", "2462015",
        "1396132", "1029599", "209296", "2089698", "1571453",
    ]
    photo_id = housing_photos[hash(ext_id) % len(housing_photos)]
    image_url = f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w=800"

    return {
        "title": f"{name} — {neighbourhood}",
        "description": description,
        "address": address,
        "neighbourhood": neighbourhood,
        "price": price_for_bedrooms(bedrooms),
        "bedrooms": bedrooms,
        "bathrooms": max(1.0, bedrooms * 1.0),
        "sqft": 450 + bedrooms * 150,
        "type": "RENTAL",
        "latitude": round(lat, 7),
        "longitude": round(lon, 7),
        "source": "toronto_open_data",
        "external_id": ext_id,
        "image_url": image_url,
    }


def upsert(conn: psycopg2.extensions.connection, rows: list[dict]) -> int:
    sql = """
        INSERT INTO listings
            (title, description, address, neighbourhood, price, bedrooms, bathrooms,
             sqft, type, latitude, longitude, source, external_id, image_url)
        VALUES %s
        ON CONFLICT (external_id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            image_url = EXCLUDED.image_url,
            updated_at = NOW()
        WHERE listings.source = 'toronto_open_data'
    """
    template = "(%(title)s, %(description)s, %(address)s, %(neighbourhood)s, %(price)s, %(bedrooms)s, %(bathrooms)s, %(sqft)s, %(type)s, %(latitude)s, %(longitude)s, %(source)s, %(external_id)s, %(image_url)s)"

    # Need a unique constraint on external_id for ON CONFLICT — add if missing
    with conn.cursor() as cur:
        cur.execute("""
            DO $$ BEGIN
                ALTER TABLE listings ADD CONSTRAINT listings_external_id_key UNIQUE (external_id);
            EXCEPTION WHEN duplicate_table THEN NULL;
            END $$;
        """)
        execute_values(cur, sql, rows, template=template)
    conn.commit()
    return len(rows)


def run() -> None:
    log.info("Fetching Toronto affordable rental data…")
    records = fetch_records()
    log.info("Fetched %d records", len(records))

    rows = [r for rec in records if (r := transform(rec)) is not None]
    log.info("Transformed %d valid rows", len(rows))

    if not rows:
        log.warning("No rows to insert")
        return

    conn = psycopg2.connect(DATABASE_URL)
    try:
        inserted = upsert(conn, rows)
        log.info("Upserted %d listings", inserted)
    finally:
        conn.close()


if __name__ == "__main__":
    run()
