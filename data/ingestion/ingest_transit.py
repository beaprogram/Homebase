#!/usr/bin/env python3
"""Seed TTC transit stops into the transit_stops table."""

import os
import logging
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://homebase:homebase@localhost:5432/homebase")

TTC_STOPS = [
    ("Bloor-Yonge Station", 43.6709, -79.3858, "subway"),
    ("Union Station", 43.6453, -79.3806, "subway"),
    ("Spadina Station", 43.6674, -79.4033, "subway"),
    ("St. George Station", 43.6683, -79.3981, "subway"),
    ("Eglinton Station", 43.7063, -79.3984, "subway"),
    ("Sheppard-Yonge Station", 43.7617, -79.4103, "subway"),
    ("Finch Station", 43.7806, -79.4150, "subway"),
    ("Kipling Station", 43.6361, -79.5361, "subway"),
    ("Scarborough Town Centre", 43.7736, -79.2574, "LRT"),
    ("Kennedy Station", 43.7317, -79.2639, "subway"),
    ("Islington Station", 43.6439, -79.5258, "subway"),
    ("Lawrence West Station", 43.7147, -79.4556, "subway"),
    ("Ossington Station", 43.6625, -79.4261, "subway"),
    ("Dufferin Station", 43.6597, -79.4393, "subway"),
    ("Dundas West Station", 43.6556, -79.4434, "subway"),
    ("Runnymede Station", 43.6511, -79.4767, "subway"),
    ("Jane Station", 43.6494, -79.4867, "subway"),
    ("Old Mill Station", 43.6467, -79.5028, "subway"),
    ("Pape Station", 43.6783, -79.3483, "subway"),
    ("Donlands Station", 43.6864, -79.3350, "subway"),
]


def ensure_table(conn: psycopg2.extensions.connection) -> None:
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS transit_stops (
                id        BIGSERIAL PRIMARY KEY,
                stop_name VARCHAR(200) NOT NULL,
                latitude  NUMERIC(10, 7),
                longitude NUMERIC(10, 7),
                route_type VARCHAR(50)
            )
        """)
    conn.commit()


def seed(conn: psycopg2.extensions.connection) -> int:
    with conn.cursor() as cur:
        cur.execute("DELETE FROM transit_stops")
        execute_values(
            cur,
            "INSERT INTO transit_stops (stop_name, latitude, longitude, route_type) VALUES %s",
            TTC_STOPS,
        )
    conn.commit()
    return len(TTC_STOPS)


def run() -> None:
    conn = psycopg2.connect(DATABASE_URL)
    try:
        ensure_table(conn)
        count = seed(conn)
        log.info("Seeded %d transit stops", count)
    finally:
        conn.close()


if __name__ == "__main__":
    run()
