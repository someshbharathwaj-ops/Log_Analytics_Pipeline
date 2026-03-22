"""FastAPI application entrypoint."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router as analytics_router

app = FastAPI(
    title="Log Analytics Pipeline",
    description="Functional log analytics backend for the log analytics dashboard.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics_router)


@app.get("/", tags=["meta"])
def root() -> dict[str, str]:
    """Basic root endpoint for local API discovery."""
    return {
        "name": "Log Analytics Pipeline API",
        "docs": "/docs",
        "health": "/api/analytics/health",
    }
