from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionResponse

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionResponse], summary="List transactions with filtering")
@router.get("/", response_model=List[TransactionResponse], include_in_schema=False)
async def list_transactions(
    status_filter: Optional[str] = None,
    payment_method: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    if status_filter and status_filter != "all":
        query = query.filter(Transaction.status == status_filter)
    if payment_method and payment_method != "all":
        query = query.filter(Transaction.payment_method == payment_method)
    
    return query.order_by(Transaction.created_at.desc()).limit(limit).all()

@router.get("/{transaction_id}", response_model=TransactionResponse, summary="Get transaction details")
async def get_transaction_by_id(transaction_id: str, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction '{transaction_id}' not found."
        )
    return txn
