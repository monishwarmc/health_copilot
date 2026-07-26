from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.exceptions.auth import InvalidCredentialsException
from app.models.user import User
from app.repositories.user_repository import user_repository

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:

    payload = decode_access_token(token)

    user_id = payload.get("sub")

    if user_id is None:
        raise InvalidCredentialsException()

    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise InvalidCredentialsException()

    user = user_repository.get_by_id(
        db=db,
        user_id=user_uuid,
    )

    if user is None:
        raise InvalidCredentialsException()

    if not user.is_active:
        raise InvalidCredentialsException()

    return user