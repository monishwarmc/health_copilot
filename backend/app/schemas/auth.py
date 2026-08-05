from pydantic import BaseModel, EmailStr
from app.schemas.user import UserResponse
from pydantic import field_validator


def validate_password(value:str):
        if len(value) < 8:
            raise ValueError(
                "Password must contain at least 8 characters."
            )
        elif len(value) > 128:
            raise ValueError(
                "Password should not exceed 128 characters"
            )
        return value
    
def validate_name(value:str):
        if len(value) < 2:
            raise ValueError(
                "Name must contain at least 2 characters."
            )
        elif len(value) > 100:
            raise ValueError(
                "Name should not exceed 100 characters"
            )
        return value
class UserRegisterRequest(BaseModel):
    
    full_name: str
    @field_validator("full_name")
    @classmethod
    def validate(cls, value: str):
        return validate_name(value=value)
    
    email: EmailStr
    password: str
    @field_validator("password")
    @classmethod
    def validate_(cls, value:str):
        return validate_password(value=value)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str
    @field_validator("password")
    @classmethod
    def validate(cls, value: str):
        return validate_password(value=value)
    
class TokenResponse(BaseModel):
    
    access_token: str
    token_type: str = "bearer"
    
class AuthResponse(BaseModel):
    user: UserResponse
    token: TokenResponse
    
class GoogleLoginRequest(BaseModel):
    id_token: str
    
class MessageResponse(BaseModel):
    message: str
    
class VerifyEmailRequest(BaseModel):
    token: str
    
class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    @field_validator("new_password")
    @classmethod
    def validate(cls, value:str):
        return validate_password(value=value)
    
    
class ProfileUpdateRequest(BaseModel):
    full_name: str | None = None
    @field_validator("full_name")
    @classmethod
    def validate(cls, value: str):
        if value is None:
            return value
        return validate_name(value=value)
    profile_picture: str | None = None
    

class PasswordChangeRequest(BaseModel):
    old_password: str 
    @field_validator("old_password")
    @classmethod
    def validate(cls, value:str):
        return validate_password(value=value)
    new_password: str 
    @field_validator("new_password")
    @classmethod
    def validate_(cls, value:str):
        return validate_password(value=value)
   
    
class AccountDeleteRequest(BaseModel):
    password: str | None = None
    @field_validator("password")
    @classmethod
    def validate(cls, value:str):
        if value is None:
            return value
        return validate_password(value=value)
    google_token : str | None = None
        
