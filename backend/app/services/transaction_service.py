from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate

class TransactionService:
    def create_transaction(self, db: Session, data: TransactionCreate) -> Transaction:
        db_obj = Transaction(
            id=data.id,
            merchant_id=data.merchant_id,
            amount=data.amount,
            currency=data.currency,
            status=data.status,
            failure_reason=data.failure_reason,
            payment_method=data.payment_method
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_transaction(self, db: Session, transaction_id: str) -> Optional[Transaction]:
        return db.query(Transaction).filter(Transaction.id == transaction_id).first()

    def get_merchant_transactions(self, db: Session, merchant_id: str, limit: int = 50) -> List[Transaction]:
        return db.query(Transaction).filter(Transaction.merchant_id == merchant_id).limit(limit).all()

transaction_service = TransactionService()
