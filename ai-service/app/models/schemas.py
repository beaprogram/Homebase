from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500)
    top_k: int = Field(default=5, ge=1, le=20)


class ListingResult(BaseModel):
    id: int
    title: str
    neighbourhood: str | None = None
    price: float | None = None
    type: str | None = None
    description: str | None = None


class AskResponse(BaseModel):
    answer: str
    listings: list[ListingResult]
    query_time_ms: float
