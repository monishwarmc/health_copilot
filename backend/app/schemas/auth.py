from pydantic import BaseModel, EmailStr, Field
from app.schemas.user import UserResponse


class UserRegisterRequest(BaseModel):
    
    full_name: str = Field(
        min_length=2,
        max_length=100
    )
    
    email: EmailStr
    
    password: str = Field(
        min_length=8,
        max_length=128
    )
    
class UserLoginRequest(BaseModel):
    
    email: EmailStr
    
    password: str = Field(
        min_length=8,
        max_length=128
    )
    
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