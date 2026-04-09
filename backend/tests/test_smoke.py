"""Minimal smoke test. Run with: pytest backend/tests"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_list_products_empty_ok():
    r = client.get("/api/v1/products")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
