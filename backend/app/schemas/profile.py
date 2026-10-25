from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import ActivityLevel, DietPreference, Gender, Goal


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

    full_name: str | None = Field(default=None, min_length=2, max_length=100)

    profile_picture: str | None = Field(default=None, max_length=500)

    gender: Gender | None = None

    date_of_birth: date | None = None

    height_cm: float | None = Field(default=None, gt=0, le=300)

    target_weight_kg: float | None = Field(default=None, gt=0, le=1000)

    activity_level: ActivityLevel | None = None

    goal: Goal | None = None

    diet_preference: DietPreference | None = None

    medical_conditions: str | None = Field(default=None, max_length=5000)

    food_allergies: str | None = Field(default=None, max_length=5000)

    bio: str | None = Field(default=None, max_length=2000)

    @field_validator("full_name", mode="before")
    @classmethod
    def normalize_full_name(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value: date | None) -> date | None:
        if value is not None and value > date.today():
            raise ValueError("Date of birth cannot be in the future.")
        return value
