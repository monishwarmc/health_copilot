from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, field_validator


class WeightCreateRequest(BaseModel):
    weight_kg: float
    notes: str | None = None
    recorded_at: date | None = None

    @field_validator("weight_kg")
    @classmethod
    def validate_weight(cls, value: float):
        if value <= 0:
            raise ValueError("Weight must be greater than 0 kg.")
        if value > 1000:
            raise ValueError("Weight must be less than 1000 kg.")
        return value


class WeightUpdateRequest(BaseModel):
    weight_kg: float | None = None
    notes: str | None = None
    recorded_at: date | None = None

    @field_validator("weight_kg")
    @classmethod
    def validate_weight(cls, value: float | None):
        if value is None:
            return value
        if value <= 0:
            raise ValueError("Weight must be greater than 0 kg.")
        if value > 1000:
            raise ValueError("Weight must be less than 1000 kg.")
        return value


class WeightResponse(BaseModel):
    id: UUID
    weight_kg: float
    notes: str | None
    recorded_at: date
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class WeightListResponse(BaseModel):
    items: list[WeightResponse]
    total: int
    page: int
    limit: int
    pages: int
    
class WeightStatsResponse(BaseModel):
    current_weight: float | None
    starting_weight: float | None
    target_weight: float | None

    weight_change: float | None
    remaining_to_goal: float | None
    goal_progress_percent: float | None

    entries: int
    latest_recorded_at: date | None