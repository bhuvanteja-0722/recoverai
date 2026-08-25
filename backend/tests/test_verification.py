import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_verification_status():
    """CRITICAL TEST: Ensures GET /api/v1/verification/ returns valid status"""
    response = client.get("/api/v1/verification/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    assert "Verification service is operational" in data["message"]
    assert "version" in data

def test_verify_action_outcome():
    response = client.post(
        "/api/v1/verification/action",
        json={
            "transaction_id": "txn_test_12345",
            "action_executed": "RETRY_PAYMENT",
            "parameters": {"retry_attempt": 1}
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_id"] == "txn_test_12345"
    assert data["action_executed"] == "RETRY_PAYMENT"
    assert data["verified"] is True
    assert "verification_id" in data

def test_verification_history():
    # First create an action
    client.post(
        "/api/v1/verification/action",
        json={
            "transaction_id": "txn_history_test",
            "action_executed": "SEND_PAYMENT_LINK"
        }
    )
    response = client.get("/api/v1/verification/history/txn_history_test")
    assert response.status_code == 200
    data = response.json()
    assert "records" in data
    assert len(data["records"]) > 0
