from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import status

from app.core.database import get_db
from app.schemas.auth import (
    AuthResponse,
    UserLoginRequest,
    UserRegisterRequest,
    GoogleLoginRequest,
    MessageResponse,
    VerifyEmailRequest
)
from app.services.auth_service import auth_service

from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)



@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a new local account and sends a verification email.",
)
def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_db),
) -> MessageResponse:
    return auth_service.register(
        db=db,
        request=request,
    )
    
    
@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK
)
def login(
    request: UserLoginRequest,
    db: Session = Depends(get_db)
) -> AuthResponse:
    return auth_service.login(
        db=db,
        request=request
    )
    

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:

    return UserResponse.model_validate(
        current_user
    )
    
@router.post(
    "/google",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK
)
def google_login(
    request: GoogleLoginRequest,
    db: Session = Depends(get_db)
) -> AuthResponse:
    return auth_service.google_login(
        id_token=request.id_token,
        db=db
    )
    
@router.post(
    "/verify-email",
    response_model=MessageResponse,
)
def verify_email(
    request: VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    return auth_service.verify_email(
        db=db,
        request=request,
    )