from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
)
from app.models.user import User
from app.repositories.user_repository import user_repository
from app.schemas.auth import (
    TokenResponse,
    UserRegisterRequest,
    AuthResponse,
    UserLoginRequest,
    MessageResponse,
    VerifyEmailRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ProfileUpdateRequest,
    AccountDeleteRequest,
    PasswordChangeRequest
)
from app.schemas.user import UserResponse
from app.exceptions.auth import (
    EmailAlreadyExistsException,
    InvalidCredentialsException,
    InvalidGoogleEmailException,
    GoogleAccountException,
    EmailNotVerifiedException,
)
from app.core.security import verify_password, create_email_verification_token

from google.auth.transport import requests
from app.core.config import settings

from google.oauth2 import id_token as google_id_token
from google.auth.exceptions import GoogleAuthError
from app.models.enums import AuthProvider
from datetime import datetime, UTC

from app.core.logging import logger
from app.services.email_service import email_service
from app.core.security import verify_email_verification_token

class AuthService:
    
    # authenticating user
    def _authenticate_user(
            self,
            db: Session,
            user: User,
        ) -> AuthResponse:
            """
            Finalizes authentication for any login method.
    
            - Updates last login timestamp
            - Persists changes
            - Generates JWT
            - Returns AuthResponse
            """
    
            user.last_login_at = datetime.now(UTC)
    
            db.commit()
            db.refresh(user)
    
            access_token = create_access_token(
                {
                    "sub": str(user.id)
                }
            )
    
            return AuthResponse(
                user=UserResponse.model_validate(user),
                token=TokenResponse(
                    access_token=access_token,
                ),
            )
    
    #Regiter user
    def register(
    self,
    db: Session,
    request: UserRegisterRequest,
    ) -> MessageResponse:

        existing_user = user_repository.get_by_email(
            db,
            request.email,
        )

        if existing_user:
            raise EmailAlreadyExistsException()

        hashed_password = hash_password(
            request.password
        )

        user = User(
            full_name=request.full_name,
            email=request.email,
            hashed_password=hashed_password,
            is_verified=False
        )

        token = create_email_verification_token(user.email)

        verification_url = (
            f"{settings.FRONTEND_URL}/verify-email?token={token}"
        )

        email_service.send_verification_email(
            to_email=user.email,
            full_name=user.full_name,
            verification_url=verification_url,
        )
        
        user = user_repository.create(
                    db,
                    user,
                )
                
        logger.info(
            "New user registered: %s",
            user.email,
        )

        return MessageResponse(
            message="Registration successful, verify your email. Please make sure to check in spam folder, if you can't it in inbox"
        )
      
    #user Login  
    def login(
        self,
        db: Session,
        request: UserLoginRequest,
    ) -> AuthResponse:
        
        user = user_repository.get_by_email(
            db=db,
            email=request.email,
        )
        
        if user is None:
            raise InvalidCredentialsException()
        
        if user.hashed_password is None:
            raise GoogleAccountException()
        
        if not verify_password(
            request.password,
            user.hashed_password,
        ):
            raise InvalidCredentialsException()
        
        if not user.is_verified:
            raise EmailNotVerifiedException()
        
        logger.info(
            "User logged in: %s",
            user.email,
        )
        return self._authenticate_user(
            db=db,
            user=user,
        )
    
    # verifies google id or token
    def _verify_google_token(self, id_token: str) -> dict:
        try:
            return google_id_token.verify_oauth2_token(
                id_token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except GoogleAuthError:
            raise InvalidCredentialsException()
        
    #google login  
    def google_login(
        self,
        db: Session,
        id_token: str
    ) -> AuthResponse:
        
        id_info = self._verify_google_token(id_token=id_token)
        
        email = id_info["email"]
        
        google_id = id_info["sub"]

        name = id_info.get("name")

        picture = id_info.get("picture")

        email_verified = id_info["email_verified"]
        
        if not email_verified:
            raise InvalidGoogleEmailException()
        
        user = None

        if google_id:
            user = user_repository.get_by_google_id(
                db=db,
                google_id=google_id,
            )

        if user is None:
            user = user_repository.get_by_email(
                db=db,
                email=email,
            )

        if user:

            # Link an existing local account with Google
            if user.google_id is None:
                user.google_id = google_id

            # Save Google profile picture if we don't have one
            if picture and not user.profile_picture:
                user.profile_picture = picture

        else:
            user = User(
                full_name=name,
                email=email,
                profile_picture=picture,
                auth_provider=AuthProvider.GOOGLE,
                google_id=google_id,
                is_verified=True
            )

            user = user_repository.create(
                db=db,
                user=user,
            )
            
        logger.info(
            "Google login successful: %s",
            user.email,
        )

        return self._authenticate_user(
            db=db,
            user=user,
        )
       
    #email verification 
    def verify_email(
    self,
    db: Session,
    request: VerifyEmailRequest,
    ) -> MessageResponse:

        email = verify_email_verification_token(
            request.token,
        )

        user = user_repository.get_by_email(
            db=db,
            email=email,
        )

        if user is None:
            raise InvalidCredentialsException()

        if user.is_verified:
            return MessageResponse(
                message="Email is already verified."
            )

        user.is_verified = True

        db.commit()

        logger.info(
            "Email verified: %s",
            user.email,
        )

        return MessageResponse(
            message="Email verified successfully."
        )
        
    # forgot password 
    def forgot_password(
        self,
        db: Session,
        request: ForgotPasswordRequest
    )-> MessageResponse:
        
        email = request.email
        user = user_repository.get_by_email(
            db=db,
            email=email
        )
        if user is None:
            return MessageResponse(
                message="If an account exists with this email, a password reset link has been sent. Please make sure to check in spam folder, if you can't find it in inbox"
            )
        if not user.is_verified:
            raise EmailNotVerifiedException()
        token = create_email_verification_token(
            email=user.email
        )
        verification_url = (
            f"{settings.FRONTEND_URL}/reset-password?token={token}"
        )
        email_service.send_password_reset_email(
            to_email=user.email,
            full_name=user.full_name,
            verification_url=verification_url
        )
        logger.info(
            "reset password link sent to: %s",
            user.email,
        )
        
        return MessageResponse(
            message="If an account exists, a password reset link has been sent. Please make sure to check in spam folder, if you can't find it in inbox"
        )
        
    # reset password
    def reset_password(
        self,
        db: Session,
        request: ResetPasswordRequest
    ):
        email = verify_email_verification_token(
            token=request.token
        )
        user = user_repository.get_by_email(
            db=db,
            email=email
        )
        if user is None:
            raise InvalidCredentialsException()
        if not user.is_verified:
            raise EmailNotVerifiedException()
        
        hashed_password = hash_password(
            request.new_password
        )

        user.hashed_password = hashed_password
        db.commit()
        db.refresh(user)

        logger.info(
            "Password changed: %s",
            user.email,
        )

        return MessageResponse(
            message="Password changed successfully. Please login with your new password"
        )

    # update profile
    def profile(
        self,
        request: ProfileUpdateRequest,
        db: Session,
        current_user : User
    ) -> UserResponse:
        if not current_user.is_verified:
            raise EmailNotVerifiedException()
        if request.full_name is not None:
            current_user.full_name = request.full_name
        if request.profile_picture is not None:
            current_user.profile_picture = request.profile_picture
        db.commit()
        db.refresh(current_user)
        return UserResponse.model_validate(current_user)
        
       
    # changes password 
    def password(
        self,
        request: PasswordChangeRequest,
        db: Session,
        current_user : User
    ) -> MessageResponse:
        if not current_user.is_verified:
            raise EmailNotVerifiedException()
        if current_user.hashed_password is None:
            raise GoogleAccountException()
        if not verify_password(
            plain_password=request.old_password,
            hashed_password=current_user.hashed_password
        ):
            raise InvalidCredentialsException()
        current_user.hashed_password = hash_password(
            password=request.new_password
        )
        db.commit()
        db.refresh(current_user)
        return MessageResponse(
            message="Password Updated, please login with your new password"
        )
        
    
    # deletes account
    def delete(
        self,
        request: AccountDeleteRequest,
        db: Session,
        current_user : User
    ) -> MessageResponse:
        if not current_user.is_verified:
            raise EmailNotVerifiedException()
        if current_user.hashed_password is not None:
            if request.password is None:
                raise InvalidCredentialsException()
            if not verify_password(
                plain_password=request.password,
                hashed_password=current_user.hashed_password
            ):
                raise InvalidCredentialsException()
        else:
            if not request.google_token:
                raise InvalidCredentialsException()
            id_info = self._verify_google_token(id_token=request.google_token)
            google_id = id_info["sub"]
            if google_id != current_user.google_id:
                raise InvalidGoogleEmailException()
        db.delete(current_user)
        db.commit()
        logger.info(
            "Account deleted: %s",
            current_user.email,
        )
        return MessageResponse(
            message="Account deleted successfully"
        )
        
auth_service = AuthService()