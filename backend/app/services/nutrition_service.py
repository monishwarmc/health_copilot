from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.logging import logger
from app.exceptions.nutrition import (
    NutritionFoodNotFoundException,
)
from app.exceptions.weight import (
    ResourceAccessDeniedException,
    ResourceNotFoundException,
)
from app.models.enums import SortOrder
from app.models.nutrition import NutritionLog
from app.models.user import User
from app.providers.nutrition import (
    nutrition_provider,
)
from app.repositories.nutrition_repository import (
    nutrition_repository,
)
from app.schemas.auth import MessageResponse
from app.schemas.nutrition import (
    FoodSearchItem,
    FoodSearchResponse,
    NutritionCreateRequest,
    NutritionListResponse,
    NutritionResponse,
    NutritionUpdateRequest,
)


class NutritionService:

    # ========================================================
    # SEARCH USDA
    # ========================================================

    def search(
        self,
        query: str,
    ) -> FoodSearchResponse:

        foods = nutrition_provider.search_food(
            query=query,
        )

        return FoodSearchResponse(
            items=[
                FoodSearchItem(
                    id=food.id,

                    name=food.name,

                    source="usda_fdc",

                    calories_per_100g=(
                        food.calories_per_100g
                    ),

                    protein_g_per_100g=(
                        food.protein_g_per_100g
                    ),

                    carbs_g_per_100g=(
                        food.carbs_g_per_100g
                    ),

                    fat_g_per_100g=(
                        food.fat_g_per_100g
                    ),

                    fiber_g_per_100g=(
                        food.fiber_g_per_100g
                    ),
                )

                for food in foods
            ]
        )

    # ========================================================
    # CREATE
    # ========================================================

    def create(
        self,
        db: Session,
        request: NutritionCreateRequest,
        current_user: User,
    ) -> NutritionResponse:

        # Get USDA food only to obtain the canonical
        # food name and verify the food ID.
        food = nutrition_provider.get_food(
            request.food_id
        )

        nutrition = NutritionLog(
            user_id=current_user.id,

            food_name=food.name,

            quantity=Decimal(
                str(request.quantity)
            ),

            unit=request.unit,

            meal_type=request.meal_type,

            notes=request.notes,

            # IMPORTANT:
            # These values come directly from frontend.
            calories=Decimal(
                str(request.calories)
            ),

            protein_g=Decimal(
                str(request.protein_g)
            ),

            carbs_g=Decimal(
                str(request.carbs_g)
            ),

            fat_g=Decimal(
                str(request.fat_g)
            ),

            fiber_g=Decimal(
                str(request.fiber_g)
            ),

            source="usda_fdc",

            source_food_id=food.id,

            recorded_at=(
                request.recorded_at
                or date.today()
            ),
        )

        nutrition = nutrition_repository.create(
            db=db,
            nutrition=nutrition,
        )

        logger.info(
            "Nutrition recorded: %s",
            current_user.email,
        )

        return NutritionResponse.model_validate(
            nutrition
        )

    # ========================================================
    # LIST
    # ========================================================

    def list(
        self,
        db: Session,
        current_user: User,
        page: int,
        limit: int,
        sort: SortOrder,
    ) -> NutritionListResponse:

        skip = (page - 1) * limit

        nutrition_logs = (
            nutrition_repository.list(
                db=db,
                user_id=current_user.id,
                skip=skip,
                limit=limit,
                sort=sort,
            )
        )

        total = nutrition_repository.count(
            db=db,
            user_id=current_user.id,
        )

        return NutritionListResponse(
            items=[
                NutritionResponse.model_validate(
                    nutrition
                )

                for nutrition in nutrition_logs
            ],

            total=total,

            page=page,

            limit=limit,

            pages=(
                (total + limit - 1) // limit
            ),
        )

    # ========================================================
    # UPDATE
    # ========================================================

    def update(
        self,
        db: Session,
        request: NutritionUpdateRequest,
        current_user: User,
        nutrition_id: UUID,
    ) -> NutritionResponse:

        nutrition = (
            nutrition_repository.get_by_id(
                db=db,
                nutrition_id=nutrition_id,
            )
        )

        if nutrition is None:
            raise ResourceNotFoundException(
                "nutrition entry"
            )

        if (
            nutrition.user_id
            != current_user.id
        ):
            raise ResourceAccessDeniedException(
                "nutrition entry"
            )

        data = request.model_dump(
            exclude_unset=True
        )

        # ----------------------------------------------------
        # Food
        # ----------------------------------------------------

        if "food_id" in data:

            food = nutrition_provider.get_food(
                data["food_id"]
            )

            nutrition.food_name = food.name

            nutrition.source_food_id = food.id

            nutrition.source = "usda_fdc"

        # ----------------------------------------------------
        # Raw values from frontend
        # ----------------------------------------------------

        if "quantity" in data:
            nutrition.quantity = Decimal(
                str(data["quantity"])
            )

        if "unit" in data:
            nutrition.unit = data["unit"]

        if "calories" in data:
            nutrition.calories = Decimal(
                str(data["calories"])
            )

        if "protein_g" in data:
            nutrition.protein_g = Decimal(
                str(data["protein_g"])
            )

        if "carbs_g" in data:
            nutrition.carbs_g = Decimal(
                str(data["carbs_g"])
            )

        if "fat_g" in data:
            nutrition.fat_g = Decimal(
                str(data["fat_g"])
            )

        if "fiber_g" in data:
            nutrition.fiber_g = Decimal(
                str(data["fiber_g"])
            )

        # ----------------------------------------------------
        # Other fields
        # ----------------------------------------------------

        if "meal_type" in data:
            nutrition.meal_type = data[
                "meal_type"
            ]

        if "notes" in data:
            nutrition.notes = data[
                "notes"
            ]

        if "recorded_at" in data:
            nutrition.recorded_at = data[
                "recorded_at"
            ]

        nutrition_repository.update(
            db=db,
            nutrition=nutrition,
        )

        logger.info(
            "Nutrition updated: %s",
            current_user.email,
        )

        return NutritionResponse.model_validate(
            nutrition
        )

    # ========================================================
    # DELETE
    # ========================================================

    def delete(
        self,
        db: Session,
        current_user: User,
        nutrition_id: UUID,
    ) -> MessageResponse:

        nutrition = (
            nutrition_repository.get_by_id(
                db=db,
                nutrition_id=nutrition_id,
            )
        )

        if nutrition is None:
            raise ResourceNotFoundException(
                "nutrition entry"
            )

        if (
            nutrition.user_id
            != current_user.id
        ):
            raise ResourceAccessDeniedException(
                "nutrition entry"
            )

        nutrition_repository.delete(
            db=db,
            nutrition=nutrition,
        )

        logger.info(
            "Nutrition deleted: %s",
            current_user.email,
        )

        return MessageResponse(
            message="Nutrition entry deleted."
        )


nutrition_service = NutritionService()