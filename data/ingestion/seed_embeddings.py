#!/usr/bin/env python3
"""Generate pgvector embeddings for listings that don't have one yet."""

import os
import logging
import psycopg2
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://homebase:homebase@localhost:5432/homebase")
BATCH_SIZE = 50


def ensure_pgvector(conn: psycopg2.extensions.connection) -> None:
    with conn.cursor() as cur:
        try:
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
            cur.execute("ALTER TABLE listings ADD COLUMN IF NOT EXISTS embedding vector(384)")
            conn.commit()
        except Exception as exc:
            conn.rollback()
            log.warning("pgvector setup skipped (not installed): %s", exc)


def get_unembedded(conn: psycopg2.extensions.connection, batch: int) -> list[tuple]:
    with conn.cursor() as cur:
        cur.execute(
            """SELECT id, title, description, neighbourhood
               FROM listings
               WHERE embedding IS NULL
               LIMIT %s""",
            (batch,),
        )
        return cur.fetchall()


def update_embeddings(conn: psycopg2.extensions.connection, rows: list[tuple[int, list[float]]]) -> None:
    with conn.cursor() as cur:
        for listing_id, vector in rows:
            vector_str = "[" + ",".join(f"{v:.6f}" for v in vector) + "]"
            cur.execute(
                "UPDATE listings SET embedding = %s::vector WHERE id = %s",
                (vector_str, listing_id),
            )
    conn.commit()


def run() -> None:
    from sentence_transformers import SentenceTransformer

    log.info("Loading embedding model…")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    conn = psycopg2.connect(DATABASE_URL)
    ensure_pgvector(conn)

    total = 0
    while True:
        rows = get_unembedded(conn, BATCH_SIZE)
        if not rows:
            break

        texts = [
            f"{row[1]} {row[2] or ''} {row[3] or ''}".strip()
            for row in rows
        ]
        vectors = model.encode(texts, normalize_embeddings=True)

        updates = [(row[0], vec.tolist()) for row, vec in zip(rows, vectors)]
        update_embeddings(conn, updates)
        total += len(updates)
        log.info("Embedded %d listings (total: %d)", len(updates), total)

    conn.close()
    log.info("Done. Embedded %d listings total.", total)


if __name__ == "__main__":
    run()
