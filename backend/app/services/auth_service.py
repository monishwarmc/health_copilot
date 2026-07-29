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
    VerifyEmailRequest
)
from app.schemas.user import UserResponse
from app.exceptions.auth import (
    EmailAlreadyExistsException,
    InvalidCredentialsException,
    InvalidGoogleEmailException,
    GoogleAccountException,
    EmailNotVerifiedException
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
            f"https://health-copilot-rouge.vercel.app/verify-email?token={token}"
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
            message="Registration successful. Please verify your email. we have sent you an verification email to your inbox"
        )
      
        
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
        
        
    def google_login(
        self,
        db: Session,
        id_token: str
    ) -> AuthResponse:
        
        try:
            id_info = google_id_token.verify_oauth2_token(
                id_token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except GoogleAuthError:
            raise InvalidCredentialsException()
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

            # Optional: mark it as supporting Google login
            if user.auth_provider == AuthProvider.LOCAL:
                user.auth_provider = AuthProvider.GOOGLE

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
        
auth_service = AuthService()