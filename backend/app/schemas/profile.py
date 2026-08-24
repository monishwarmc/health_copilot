from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


# ============================================================
# PROFILE RESPONSE
# ============================================================

class ProfileResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID

    full_name: str
    email: str

    profile_picture: str | None = None

    gender: str | None = None
    date_of_birth: date | None = None

    height_cm: float | None = None
    target_weight_kg: float | None = None

    activity_level: str | None = None
    goal: str | None = None

    diet_preference: str | None = None

    medical_conditions: str | None = None
    food_allergies: str | None = None

    bio: str | None = None

    created_at: datetime
    updated_at: datetime | None = None


# ============================================================
# PROFILE UPDATE REQUEST
# ============================================================

class ProfileUpdateRequest(BaseModel):

    full_name: str | None = None

    profile_picture: str | None = None

    gender: str | None = None

    date_of_birth: date | None = None

    height_cm: float | None = None

    target_weight_kg: float | None = None

    activity_level: str | None = None

    goal: str | None = None

    diet_preference: str | None = None

    medical_conditions: str | None = None

    food_allergies: str | None = None

    bio: str | None = None