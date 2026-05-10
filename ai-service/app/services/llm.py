import anthropic
from ..config import settings
from ..models.schemas import ListingResult


def ask_claude(query: str, listings: list[ListingResult]) -> str:
    if not settings.anthropic_api_key:
        return _fallback_answer(query, listings)

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    context_parts = []
    for i, listing in enumerate(listings, 1):
        parts = [f"{i}. **{listing.title}**"]
        if listing.neighbourhood:
            parts.append(f"Neighbourhood: {listing.neighbourhood}")
        if listing.price is not None:
            price_str = f"${listing.price:,.0f}" + ("/mo" if listing.type == "RENTAL" else "")
            parts.append(f"Price: {price_str}")
        if listing.type:
            parts.append(f"Type: {listing.type}")
        if listing.description:
            parts.append(f"Description: {listing.description[:200]}")
        context_parts.append("\n".join(parts))

    context = "\n\n".join(context_parts)

    message = client.messages.create(
        model=settings.llm_model,
        max_tokens=1024,
        system=(
            "You are a helpful housing assistant for Toronto, Canada. "
            "Answer questions about listings concisely and cite specific listings by name. "
            "Be direct and helpful. Format prices clearly."
        ),
        messages=[
            {
                "role": "user",
                "content": f"Available listings:\n\n{context}\n\nUser question: {query}",
            }
        ],
    )

    return message.content[0].text


def _fallback_answer(query: str, listings: list[ListingResult]) -> str:
    if not listings:
        return "I couldn't find any matching listings for your query."
    names = ", ".join(l.title for l in listings[:3])
    return f"Based on your query, here are some relevant listings: {names}. (AI key not configured for detailed answers.)"
