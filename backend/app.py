"""FastAPI application entrypoint."""

from __future__ import annotations

from fastapi import FastAPI

from backend.api.routes import router as analytics_router

app = FastAPI(
    title="Log Analytics Pipeline",
    description="Functional log analytics backend built with FastAPI.",
    version="1.0.0",
)

app.include_router(analytics_router)

