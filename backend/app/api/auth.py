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
    VerifyEmailRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ProfileUpdateRequest,
    PasswordChangeRequest,
    AccountDeleteRequest
)
from app.services.auth_service import auth_service

from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


#Register
@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_db),
) -> MessageResponse:
    return auth_service.register(
        db=db,
        request=request,
    )
    

#Login 
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
    

#get_me
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


#Google auth
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
    

#Verify email
@router.post(
    "/verify-email",
    response_model=MessageResponse,
)
def verify_email(
    request: VerifyEmailRequest,
    db: Session = Depends(get_db),
) -> MessageResponse:
    return auth_service.verify_email(
        db=db,
        request=request,
    )
    

#Forgot password
@router.post(
    "/forgot-password",
    response_model=MessageResponse
)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
) -> MessageResponse:
    return auth_service.forgot_password(
        db=db,
        request=request
    )
    
    
#Reset password
@router.post(
    "/reset-password",
    response_model=MessageResponse
)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
) -> MessageResponse:
    return auth_service.reset_password(
        db=db,
        request=request
    )
    
    
#Update profile
@router.patch(
    "/profile",
    response_model=UserResponse
)
def profile(
    request: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
) -> UserResponse:
    return auth_service.profile(
        request=request,
        db=db,
        current_user=current_user
    )
    
    
#Password change
@router.patch(
    "/password",
    response_model=MessageResponse
)
def password(
    request: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
) -> MessageResponse:
    return auth_service.password(
        request=request,
        db=db,
        current_user=current_user
    )
    
    
#Delete account
@router.delete(
    "/account",
    response_model=MessageResponse
)
def delete(
    request: AccountDeleteRequest,
    db: Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
) -> MessageResponse:
    return auth_service.delete(
        request=request,
        db=db,
        current_user=current_user
    )