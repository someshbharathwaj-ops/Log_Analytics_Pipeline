"""FastAPI routes for log analytics."""

from __future__ import annotations

from dataclasses import asdict
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.pipeline.pipeline import PipelineResult, run_pipeline, run_pipeline_from_content

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/health")
def health_check() -> dict[str, str]:
    """Health endpoint for deployment checks."""
    return {"status": "ok"}


@router.post("/analyze")
async def analyze_logs(file: UploadFile = File(...), level: str | None = None) -> dict:
    """Analyze uploaded logs and return aggregate metrics."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="A log file must be provided.")

    raw = await file.read()
    content = raw.decode("utf-8", errors="ignore")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Uploaded log file is empty.")

    try:
        result: PipelineResult = run_pipeline_from_content(content, level=level)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return asdict(result)


@router.get("/analyze-sample")
def analyze_sample(level: str | None = None) -> dict:
    """Analyze the sample dataset in data/server_logs.txt."""
    sample_path = Path("data/server_logs.txt")
    if not sample_path.exists():
        raise HTTPException(status_code=404, detail="Sample data file not found.")

    try:
        result: PipelineResult = run_pipeline(sample_path, level=level)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return asdict(result)
