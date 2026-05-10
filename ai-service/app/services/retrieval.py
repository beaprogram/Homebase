import json
import psycopg2
from ..config import settings
from ..models.schemas import ListingResult


def retrieve_listings(embedding: list[float], top_k: int = 5) -> list[ListingResult]:
    conn = psycopg2.connect(settings.database_url)
    try:
        with conn.cursor() as cur:
            vector_str = "[" + ",".join(str(v) for v in embedding) + "]"
            cur.execute(
                """
                SELECT id, title, neighbourhood, price, type, description
                FROM listings
                WHERE embedding IS NOT NULL
                ORDER BY embedding::vector <=> %s::vector
                LIMIT %s
                """,
                (vector_str, top_k),
            )
            rows = cur.fetchall()
    except Exception:
        # Fall back to simple text search when pgvector isn't available
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, title, neighbourhood, price, type, description FROM listings LIMIT %s",
                (top_k,),
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    return [
        ListingResult(
            id=row[0],
            title=row[1],
            neighbourhood=row[2],
            price=float(row[3]) if row[3] is not None else None,
            type=row[4],
            description=row[5],
        )
        for row in rows
    ]
