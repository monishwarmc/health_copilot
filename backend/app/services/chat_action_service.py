from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.chat import (
    ExecuteChatActionRequest,
    ExecuteChatActionResponse,
)
from app.schemas.nutrition import (
    NutritionCreateRequest,
    NutritionUpdateRequest,
)
from app.schemas.profile import (
    ProfileUpdateRequest,
)
from app.schemas.weight import (
    WeightCreateRequest,
    WeightUpdateRequest,
)


class ChatActionService:

    # ============================================================
    # EXECUTE
    # ============================================================

    def execute(
        self,
        db: Session,
        user: User,
        request: ExecuteChatActionRequest,
    ) -> ExecuteChatActionResponse:

        action_type = request.action_type

        # ========================================================
        # PROFILE
        # ========================================================

        if action_type == "UPDATE_PROFILE":

            return self._update_profile(
                db=db,
                user=user,
                payload=request.payload,
            )

        # ========================================================
        # WEIGHT
        # ========================================================

        if action_type == "ADD_WEIGHT":

            return self._add_weight(
                db=db,
                user=user,
                payload=request.payload,
            )

        if action_type == "UPDATE_WEIGHT":

            return self._update_weight(
                db=db,
                user=user,
                payload=request.payload,
            )

        # ========================================================
        # NUTRITION
        # ========================================================

        if action_type == "ADD_NUTRITION":

            return self._add_nutrition(
                db=db,
                user=user,
                payload=request.payload,
            )

        if action_type == "UPDATE_NUTRITION":

            return self._update_nutrition(
                db=db,
                user=user,
                payload=request.payload,
            )

        if action_type == "DELETE_NUTRITION":

            return self._delete_nutrition(
                db=db,
                user=user,
                payload=request.payload,
            )

        raise ValueError(
            f"Unsupported chat action: {action_type}"
        )

    # ============================================================
    # UPDATE PROFILE
    # ============================================================

    def _update_profile(
        self,
        db: Session,
        user: User,
        payload: dict,
    ) -> ExecuteChatActionResponse:

        request = ProfileUpdateRequest(
            **payload
        )

        from app.services.profile_service import (
            profile_service,
        )

        profile = profile_service.update_profile(
            db=db,
            current_user=user,
            request=request,
        )

        return ExecuteChatActionResponse(
            success=True,
            message="Profile updated successfully.",
            data=profile.model_dump(
                mode="json"
            ),
        )

    # ============================================================
    # ADD WEIGHT
    # ============================================================

    def _add_weight(
        self,
        db: Session,
        user: User,
        payload: dict,
    ) -> ExecuteChatActionResponse:

        weight_kg = payload.get("weight_kg")

        if weight_kg is None:

            raise ValueError(
                "weight_kg is required."
            )

        recorded_at = None

        if payload.get("recorded_at"):

            recorded_at = date.fromisoformat(
                payload["recorded_at"]
            )

        request = WeightCreateRequest(
            weight_kg=weight_kg,
            notes=payload.get("notes"),
            recorded_at=recorded_at,
        )

        from app.services.weight_service import (
            weight_service,
        )

        weight = weight_service.create(
            db=db,
            request=request,
            current_user=user,
        )

        return ExecuteChatActionResponse(
            success=True,
            message=(
                f"Weight recorded as "
                f"{weight.weight_kg} kg."
            ),
            data={
                "id": str(weight.id),
                "weight_kg": weight.weight_kg,
                "recorded_at": str(
                    weight.recorded_at
                ),
                "notes": weight.notes,
            },
        )

    # ============================================================
    # UPDATE WEIGHT
    # ============================================================

    def _update_weight(
        self,
        db: Session,
        user: User,
        payload: dict,
    ) -> ExecuteChatActionResponse:

        weight_id = payload.get(
            "weight_id"
        )

        if not weight_id:

            raise ValueError(
                "weight_id is required."
            )

        try:

            weight_id = UUID(
                str(weight_id)
            )

        except (ValueError, TypeError):

            raise ValueError(
                "Invalid weight_id."
            )

        recorded_at = None

        if payload.get("recorded_at"):

            try:

                recorded_at = date.fromisoformat(
                    payload["recorded_at"]
                )

            except (ValueError, TypeError):

                raise ValueError(
                    "Invalid recorded_at. "
                    "Expected YYYY-MM-DD."
                )

        request = WeightUpdateRequest(
            weight_kg=payload.get(
                "weight_kg"
            ),
            notes=payload.get("notes"),
            recorded_at=recorded_at,
        )

        from app.services.weight_service import (
            weight_service,
        )

        weight = weight_service.update(
            db=db,
            request=request,
            current_user=user,
            weight_id=weight_id,
        )

        return ExecuteChatActionResponse(
            success=True,
            message="Weight entry updated.",
            data={
                "id": str(weight.id),
                "weight_kg": weight.weight_kg,
                "recorded_at": str(
                    weight.recorded_at
                ),
                "notes": weight.notes,
            },
        )

    # ============================================================
    # ADD NUTRITION
    # ============================================================

    def _add_nutrition(
        self,
        db: Session,
        user: User,
        payload: dict,
    ) -> ExecuteChatActionResponse:

        request = NutritionCreateRequest(
            food_id=payload.get("food_id"),
            quantity=payload.get("quantity"),
            unit=payload.get("unit", "g"),
            meal_type=payload.get("meal_type"),
            calories=payload.get("calories"),
            protein_g=payload.get("protein_g"),
            carbs_g=payload.get("carbs_g"),
            fat_g=payload.get("fat_g"),
            fiber_g=payload.get("fiber_g"),
            notes=payload.get("notes"),
            recorded_at=(
                date.fromisoformat(
                    payload["recorded_at"]
                )
                if payload.get("recorded_at")
                else None
            ),
        )

        from app.services.nutrition_service import (
            nutrition_service,
        )

        # ========================================================
        # IMPORTANT
        #
        # Chat nutrition values are already estimated by the AI.
        # Do NOT perform a USDA lookup here.
        # ========================================================

        nutrition = nutrition_service.create(
            db=db,
            request=request,
            current_user=user,
            source="ai_estimated",
        )

        return ExecuteChatActionResponse(
            success=True,
            message=(
                f"{nutrition.food_name} "
                f"was added to your "
                f"{nutrition.meal_type.value}."
            ),
            data={
                "id": str(nutrition.id),
                "food_name": nutrition.food_name,
                "quantity": nutrition.quantity,
                "unit": nutrition.unit,
                "meal_type": (
                    nutrition.meal_type.value
                ),
                "calories": nutrition.calories,
                "protein_g": nutrition.protein_g,
                "carbs_g": nutrition.carbs_g,
                "fat_g": nutrition.fat_g,
                "fiber_g": nutrition.fiber_g,
                "recorded_at": str(
                    nutrition.recorded_at
                ),
                "notes": nutrition.notes,
                "source": nutrition.source,
                "source_food_id": (
                    nutrition.source_food_id
                ),
            },
        )

    # ============================================================
    # UPDATE NUTRITION
    # ============================================================

    def _update_nutrition(
        self,
        db: Session,
        user: User,
        payload: dict,
    ) -> ExecuteChatActionResponse:

        nutrition_id = payload.get(
            "nutrition_id"
        )

        if not nutrition_id:

            raise ValueError(
                "nutrition_id is required."
            )

        try:

            nutrition_id = UUID(
                str(nutrition_id)
            )

        except (ValueError, TypeError):

            raise ValueError(
                "Invalid nutrition_id."
            )

        update_data = {}

        allowed_fields = [
            "food_id",
            "quantity",
            "unit",
            "meal_type",
            "calories",
            "protein_g",
            "carbs_g",
            "fat_g",
            "fiber_g",
            "notes",
        ]

        for field in allowed_fields:

            if field in payload:

                update_data[field] = payload[field]

        if "recorded_at" in payload:

            if payload["recorded_at"]:

                update_data["recorded_at"] = (
                    date.fromisoformat(
                        payload["recorded_at"]
                    )
                )

            else:

                update_data["recorded_at"] = None

        request = NutritionUpdateRequest(
            **update_data
        )

        from app.services.nutrition_service import (
            nutrition_service,
        )

        nutrition = nutrition_service.update(
            db=db,
            request=request,
            current_user=user,
            nutrition_id=nutrition_id,
        )

        return ExecuteChatActionResponse(
            success=True,
            message=(
                f"{nutrition.food_name} "
                "nutrition entry updated."
            ),
            data={
                "id": str(nutrition.id),
                "food_name": nutrition.food_name,
                "quantity": nutrition.quantity,
                "unit": nutrition.unit,
                "meal_type": (
                    nutrition.meal_type.value
                ),
                "calories": nutrition.calories,
                "protein_g": nutrition.protein_g,
                "carbs_g": nutrition.carbs_g,
                "fat_g": nutrition.fat_g,
                "fiber_g": nutrition.fiber_g,
                "recorded_at": str(
                    nutrition.recorded_at
                ),
                "notes": nutrition.notes,
                "source": nutrition.source,
                "source_food_id": (
                    nutrition.source_food_id
                ),
            },
        )

    # ============================================================
    # DELETE NUTRITION
    # ============================================================

    def _delete_nutrition(
        self,
        db: Session,
        user: User,
        payload: dict,
    ) -> ExecuteChatActionResponse:

        nutrition_id = payload.get(
            "nutrition_id"
        )

        if not nutrition_id:

            raise ValueError(
                "nutrition_id is required."
            )

        try:

            nutrition_id = UUID(
                str(nutrition_id)
            )

        except (ValueError, TypeError):

            raise ValueError(
                "Invalid nutrition_id."
            )

        from app.services.nutrition_service import (
            nutrition_service,
        )

        result = nutrition_service.delete(
            db=db,
            current_user=user,
            nutrition_id=nutrition_id,
        )

        return ExecuteChatActionResponse(
            success=True,
            message=result.message,
            data={
                "nutrition_id": str(
                    nutrition_id
                )
            },
        )


chat_action_service = ChatActionService()