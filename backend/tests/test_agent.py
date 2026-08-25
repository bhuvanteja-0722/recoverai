import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_agent_diagnose_technical_failure():
    response = client.post(
        "/api/v1/agent/diagnose",
        json={
            "transaction_id": "txn_tech_001",
            "merchant_id": "merch_demo",
            "amount": 4999.0,
            "failure_reason": "Gateway timeout during bank authorization",
            "payment_method": "upi"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_id"] == "txn_tech_001"
    assert data["recoverable"] is True
    assert data["recommendation"]["action"] in ["RETRY_PAYMENT", "SEND_PAYMENT_LINK"]

def test_agent_diagnose_insufficient_funds():
    response = client.post(
        "/api/v1/agent/diagnose",
        json={
            "transaction_id": "txn_fund_002",
            "merchant_id": "merch_demo",
            "amount": 1200.0,
            "failure_reason": "Insufficient balance in account",
            "payment_method": "card"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["recommendation"]["action"] == "SEND_PAYMENT_LINK"

def test_agent_intervene():
    response = client.post(
        "/api/v1/agent/intervene",
        json={
            "transaction_id": "txn_intervene_003",
            "recommended_action": "RETRY_PAYMENT",
            "force_execution": False
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "succeeded"
    assert data["audit_hash"] is not None
