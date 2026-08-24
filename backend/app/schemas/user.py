from datetime import datetime, date
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr
from app.models.enums import (
    ActivityLevel,
    AuthProvider,
    DietPreference,
    Gender,
    Goal,
)



class UserResponse(BaseModel):
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    
    full_name: str
    
    email: EmailStr
    
    profile_picture: str | None
    
    created_at: datetime
    
    auth_provider: AuthProvider
    
    height_cm: float | None = None
    
    gender: Gender | None = None
    
    date_of_birth: date| None = None
    
    activity_level: ActivityLevel | None = None
    
    goal: Goal | None = None
    
    diet_preference:DietPreference | None = None
    
    medical_conditions: str| None = None
    
    food_allergies:str | None = None
    
    bio: str | None = None