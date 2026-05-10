from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.ask import router as ask_router

app = FastAPI(
    title="HomeBase AI Service",
    description="RAG-backed natural language Q&A over Toronto housing listings",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ask_router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
