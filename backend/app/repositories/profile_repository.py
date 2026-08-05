from sqlalchemy.orm import Session

from app.models.user import User


class ProfileRepository:

    def update(
        self,
        db: Session,
        user: User,
    ) -> User:

        db.commit()
        db.refresh(user)

        return user


profile_repository = ProfileRepository()