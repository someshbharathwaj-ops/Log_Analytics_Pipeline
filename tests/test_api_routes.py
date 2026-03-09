from __future__ import annotations

from backend.api.routes import MAX_UPLOAD_BYTES, decode_upload_content


def test_decode_upload_content_handles_utf8_bom() -> None:
    content = decode_upload_content("hello".encode("utf-8-sig"))
    assert content == "hello"


def test_decode_upload_content_handles_utf16() -> None:
    content = decode_upload_content("hello".encode("utf-16"))
    assert "hello" in content


def test_upload_limit_constant_is_5mb() -> None:
    assert MAX_UPLOAD_BYTES == 5 * 1024 * 1024
