import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.schemas import ListingResult


MOCK_LISTINGS = [
    ListingResult(id=1, title="Cozy 1BR in Annex", neighbourhood="Annex", price=1800.0, type="RENTAL"),
    ListingResult(id=2, title="Spacious 2BR Downtown", neighbourhood="Downtown", price=2800.0, type="RENTAL"),
]


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_ask_returns_answer():
    with patch("app.routers.ask.embed_text", return_value=[0.1] * 384), \
         patch("app.routers.ask.retrieve_listings", return_value=MOCK_LISTINGS), \
         patch("app.routers.ask.ask_claude", return_value="Here are some great rentals in Toronto."):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/ask", json={"query": "2-bedroom rentals under $3000", "top_k": 5})

    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "listings" in data
    assert len(data["listings"]) == 2
    assert "query_time_ms" in data


@pytest.mark.asyncio
async def test_ask_invalid_query_too_short():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/ask", json={"query": "hi", "top_k": 5})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_ask_top_k_respected():
    with patch("app.routers.ask.embed_text", return_value=[0.0] * 384), \
         patch("app.routers.ask.retrieve_listings", return_value=MOCK_LISTINGS[:1]) as mock_retrieve, \
         patch("app.routers.ask.ask_claude", return_value="One match found."):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            await client.post("/ask", json={"query": "studio apartments", "top_k": 3})
        mock_retrieve.assert_called_once_with([0.0] * 384, 3)
