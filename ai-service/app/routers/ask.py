import time
from fastapi import APIRouter
from ..models.schemas import AskRequest, AskResponse
from ..services.embedding import embed_text
from ..services.retrieval import retrieve_listings
from ..services.llm import ask_claude

router = APIRouter()


@router.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest) -> AskResponse:
    start = time.perf_counter()

    embedding = embed_text(request.query)
    listings = retrieve_listings(embedding, request.top_k)
    answer = ask_claude(request.query, listings)

    elapsed_ms = (time.perf_counter() - start) * 1000
    return AskResponse(answer=answer, listings=listings, query_time_ms=round(elapsed_ms, 1))
