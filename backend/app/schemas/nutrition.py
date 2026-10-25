from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import MealType


# ============================================================
# USDA FOOD SEARCH
# ============================================================


class FoodSearchItem(BaseModel):

    id: str

    name: str

    source: str

    calories_per_100g: float
    protein_g_per_100g: float
    carbs_g_per_100g: float
    fat_g_per_100g: float
    fiber_g_per_100g: float


class FoodSearchResponse(BaseModel):

    items: list[FoodSearchItem]


# ============================================================
# CREATE
# ============================================================


class NutritionCreateRequest(BaseModel):

    food_id: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    food_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    quantity: float = Field(
        gt=0,
    )

    unit: str = Field(
        default="g",
        min_length=1,
        max_length=20,
    )

    meal_type: MealType

    # These values are calculated by frontend.
    calories: float = Field(
        ge=0,
    )

    protein_g: float = Field(
        ge=0,
    )

    carbs_g: float = Field(
        ge=0,
    )

    fat_g: float = Field(
        ge=0,
    )

    fiber_g: float = Field(
        ge=0,
    )

    notes: str | None = None

    recorded_at: date | None = None

    @model_validator(mode="after")
    def validate_food_identity(self):
        has_food_id = bool(self.food_id and self.food_id.strip())
        has_food_name = bool(self.food_name and self.food_name.strip())

        if has_food_id == has_food_name:
            raise ValueError("Provide exactly one of food_id or food_name.")

        if self.food_name is not None:
            self.food_name = self.food_name.strip()

        return self


# ============================================================
# UPDATE
# ============================================================


class NutritionUpdateRequest(BaseModel):

    food_id: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    food_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    quantity: float | None = Field(
        default=None,
        gt=0,
    )

    unit: str | None = Field(
        default=None,
        min_length=1,
        max_length=20,
    )

    meal_type: MealType | None = None

    calories: float | None = Field(
        default=None,
        ge=0,
    )

    protein_g: float | None = Field(
        default=None,
        ge=0,
    )

    carbs_g: float | None = Field(
        default=None,
        ge=0,
    )

    fat_g: float | None = Field(
        default=None,
        ge=0,
    )

    fiber_g: float | None = Field(
        default=None,
        ge=0,
    )

    notes: str | None = None

    recorded_at: date | None = None

    @model_validator(mode="after")
    def validate_food_update(self):
        if self.food_id is not None and self.food_name is not None:
            raise ValueError("Provide either food_id or food_name, not both.")

        if self.food_name is not None:
            self.food_name = self.food_name.strip()
            if not self.food_name:
                raise ValueError("Food name cannot be empty.")

        return self


# ============================================================
# RESPONSE
# ============================================================


class NutritionResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID

    user_id: UUID

    food_name: str

    quantity: float

    unit: str

    meal_type: MealType

    notes: str | None

    recorded_at: date

    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float

    source: str | None

    source_food_id: str | None

    created_at: datetime


# ============================================================
# LIST
# ============================================================


class NutritionListResponse(BaseModel):

    items: list[NutritionResponse]

    total: int

    page: int

    limit: int

    pages: int


class NutritionDaySummary(BaseModel):
    recorded_at: date
    entries: int
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float


class NutritionSummaryResponse(BaseModel):
    start_date: date
    end_date: date
    days: list[NutritionDaySummary]
    entries: int
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
