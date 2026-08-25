import logging
import random
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.models.audit_event import AuditEvent
from app.models.verification import VerificationRecord
from app.services.audit_service import audit_service

logger = logging.getLogger("recoverai.seed")

GATEWAYS = ["Razorpay - HDFC Direct", "Razorpay - ICICI UPI", "Razorpay - SBI Card", "Razorpay - Axis Bank", "Razorpay - Paytm Gateway"]
PAYMENT_METHODS = ["upi", "card", "netbanking", "wallet"]
FAILURE_REASONS = [
    ("Gateway timeout during bank authorization", "technical"),
    ("UPI Issuer Bank Server Unavailable (NPCI 91)", "technical"),
    ("Insufficient balance in account", "customer"),
    ("3DS OTP verification timeout", "customer"),
    ("Card authorization declined by issuer", "bank"),
    ("Invalid PIN entered by customer", "customer"),
    ("Network connection dropped", "technical"),
    ("Risk Engine Flag: Suspicious activity", "fraud"),
]

def seed_database(db: Session):
    """Populates database with a rich, deterministic set of demo transactions and audit events if empty."""
    existing = db.query(Transaction).count()
    if existing >= 15:
        logger.info(f"Database already seeded ({existing} transactions found). Skipping seed.")
        return

    logger.info("Seeding database with deterministic demo dataset...")
    now = datetime.now(timezone.utc)

    # Create 40 realistic transactions
    for i in range(1, 41):
        txn_id = f"txn_prod_{1000 + i}"
        gw = GATEWAYS[i % len(GATEWAYS)]
        pm = PAYMENT_METHODS[i % len(PAYMENT_METHODS)]
        reason, category = FAILURE_REASONS[i % len(FAILURE_REASONS)]
        amount = round(random.choice([499.0, 1499.0, 2490.0, 4999.0, 8950.0, 12500.0, 45000.0, 75000.0]), 2)
        created_time = now - timedelta(hours=i * 2, minutes=i * 5)

        # Assign realistic status
        if i % 3 == 0:
            status = "recovered"
            rec_action = "RETRY_PAYMENT" if category == "technical" else "SEND_PAYMENT_LINK"
            rec_status = "succeeded"
        elif i % 5 == 0:
            status = "at_risk"
            rec_action = "SEND_PAYMENT_LINK"
            rec_status = "attempted"
        else:
            status = "failed"
            rec_action = "RETRY_PAYMENT" if category == "technical" else "SEND_PAYMENT_LINK"
            rec_status = "failed" if i % 2 == 0 else "none"

        txn = Transaction(
            id=txn_id,
            merchant_id="merch_razorpay_demo",
            amount=amount,
            currency="INR",
            status=status,
            failure_reason=reason,
            payment_method=pm,
            created_at=created_time,
            updated_at=created_time + timedelta(minutes=2),
            recovery_attempts=1 if status != "failed" else 0,
            recovery_action=rec_action,
            recovery_status=rec_status
        )
        db.add(txn)

        # Seed verification & audit record for recovered/attempted items
        if status in ["recovered", "at_risk"]:
            v_record = VerificationRecord(
                id=f"ver_seed_{100 + i}",
                transaction_id=txn_id,
                action_executed=rec_action,
                verified=status == "recovered",
                attempts_made=1,
                status_summary=f"Outcome verification completed for {rec_action}",
                evidence={
                    "gateway": gw,
                    "payment_method": pm,
                    "outcome": "captured" if status == "recovered" else "pending",
                    "status_code": 200
                },
                created_at=created_time + timedelta(minutes=1)
            )
            db.add(v_record)

            audit_service.record_event(
                db=db,
                action_type="VERIFICATION_COMPLETED" if status == "recovered" else "RECOVERY_INTERVENTION_EXECUTED",
                actor="SeedService",
                resource_id=txn_id,
                details={"status": status, "amount": amount, "action": rec_action}
            )

    db.commit()
    logger.info("Database seeding completed successfully.")
