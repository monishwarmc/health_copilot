from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID

from app.models.user import User


class UserRepository:
    
    def get_by_email(
        self,
        db: Session,
        email: str
    ) -> User | None:
        
        statement = select(User).where(User.email == email)
        
        return db.scalar(statement=statement)
    
    def get_by_google_id(
        self,
        db: Session,
        google_id: str
    ) -> User | None:
        
        statement = select(User).where(User.google_id == google_id)
        
        return db.scalar(statement=statement)
    
    
    def get_by_id(
        self,
        db: Session,
        user_id: UUID
    ) -> User | None:
        
        statement = select(User).where(User.id == user_id)
        
        return db.scalar(statement=statement)
    
    
    def create(
        self,
        db: Session,
        user: User,
    ) -> User:
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
    
    
    
user_repository = UserRepository()