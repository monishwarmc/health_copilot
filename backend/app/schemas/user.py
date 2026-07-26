from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserResponse(BaseModel):
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    
    full_name: str
    
    email: EmailStr
    
    profile_picture: str | None
    
    created_at: datetime