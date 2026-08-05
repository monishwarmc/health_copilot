from datetime import date

from pydantic import BaseModel, field_validator

from app.models.enums import (
    Gender,
    ActivityLevel,
    Goal,
    DietPreference,
)


def validate_name(value: str):
    if len(value) < 2:
        raise ValueError("Name must contain at least 2 characters.")
    if len(value) > 100:
        raise ValueError("Name should not exceed 100 characters.")
    return value


class ProfileResponse(BaseModel):
    full_name: str
    email: str
    profile_picture: str | None

    gender: Gender | None
    date_of_birth: date | None

    height_cm: float | None
    target_weight_kg: float | None

    activity_level: ActivityLevel | None
    goal: Goal | None
    diet_preference: DietPreference | None

    medical_conditions: str | None
    food_allergies: str | None
    bio: str | None

    model_config = {
        "from_attributes": True,
    }


class ProfileUpdateRequest(BaseModel):

    full_name: str | None = None

    @field_validator("full_name")
    @classmethod
    def validate(cls, value):
        if value is None:
            return value
        return validate_name(value)

    profile_picture: str | None = None

    gender: Gender | None = None
    date_of_birth: date | None = None

    height_cm: float | None = None
    target_weight_kg: float | None = None

    activity_level: ActivityLevel | None = None
    goal: Goal | None = None
    diet_preference: DietPreference | None = None

    medical_conditions: str | None = None
    food_allergies: str | None = None
    bio: str | None = None