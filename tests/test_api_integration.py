from __future__ import annotations

from fastapi.testclient import TestClient

from backend.app import app
from backend.api.routes import MAX_UPLOAD_BYTES

client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/api/analytics/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root_endpoint_exposes_api_links() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["docs"] == "/docs"


def test_analyze_sample_rejects_invalid_level() -> None:
    response = client.get("/api/analytics/analyze-sample", params={"level": "TRACE"})
    assert response.status_code == 422
    assert "Unsupported level" in response.json()["detail"]


def test_analyze_rejects_empty_upload() -> None:
    response = client.post(
        "/api/analytics/analyze",
        files={"file": ("empty.log", b"", "text/plain")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_analyze_rejects_oversized_upload() -> None:
    payload = b"a" * (MAX_UPLOAD_BYTES + 1)
    response = client.post(
        "/api/analytics/analyze",
        files={"file": ("large.log", payload, "text/plain")},
    )
    assert response.status_code == 413


def test_analyze_sample_exposes_enhanced_summary() -> None:
    response = client.get("/api/analytics/analyze-sample")
    assert response.status_code == 200

    payload = response.json()
    assert "health_status" in payload
    assert "generated_at" in payload
    assert "service_error_share" in payload
    assert payload["source"].endswith("data\\server_logs.txt") or payload["source"].endswith("data/server_logs.txt")
