from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from jwt import InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings
from app.exceptions.auth import InvalidCredentialsException, InvalidTokenException


password_hash = PasswordHash.recommended()

def hash_password(password:str) -> str:
    return password_hash.hash(password=password)

def verify_password(
    plain_password:str,
    hashed_password:str
) -> bool:
    return password_hash.verify(
        password=plain_password,
        hash= hashed_password
    )
    
def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    to_encode = data.copy()

    expire = datetime.now(UTC) + (
        expires_delta
        if expires_delta is not None
        else timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode["exp"] = expire

    return jwt.encode(
        payload=to_encode,
        key=settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

def decode_access_token(token:str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            jwt=token,
            key=settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except InvalidTokenError:
        raise InvalidCredentialsException()
    
def create_email_verification_token(email: str) -> str:
    return create_access_token(
        data={
            "sub": email,
            "type": "email_verification",
        },
        expires_delta=timedelta(
            minutes=settings.EMAIL_VERIFY_EXPIRE_MINUTES
        ),
    )

def create_password_reset_token(email: str) -> str:
    return create_access_token(
        data={
            "sub": email,
            "type": "password_reset",
        },
        expires_delta=timedelta(
            minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES,
        ),
    )
    
def verify_token_type(
    token: str,
    expected_type: str,
) -> str:
    payload = decode_access_token(token)

    if payload.get("type") != expected_type:
        raise InvalidTokenException()

    email = payload.get("sub")

    if email is None:
        raise InvalidTokenException()

    return email
    
def verify_email_verification_token(token: str) -> str:
    return verify_token_type(
        token,
        "email_verification",
    )


def verify_password_reset_token(token: str) -> str:
    return verify_token_type(
        token,
        "password_reset",
    )