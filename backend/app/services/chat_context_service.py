from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.nutrition_repository import (
    nutrition_repository,
)
from app.repositories.weight_repository import (
    weight_repository,
)


class ChatContextService:

    # ============================================================
    # CONFIGURATION
    # ============================================================

    DEFAULT_TIMEZONE = "Asia/Kolkata"

    # ============================================================
    # BUILD USER CONTEXT
    # ============================================================

    def build_user_context(
        self,
        db: Session,
        current_user: User,
    ) -> str:

        # --------------------------------------------------------
        # Current local date/time
        # --------------------------------------------------------

        now = datetime.now(
            ZoneInfo(
                self.DEFAULT_TIMEZONE
            )
        )

        # --------------------------------------------------------
        # Profile
        # --------------------------------------------------------

        profile_lines = [
            f"User ID: {current_user.id}",
            f"Full name: {current_user.full_name}",
            f"Gender: {current_user.gender}",
            f"Date of birth: {current_user.date_of_birth}",
            f"Height: {current_user.height_cm} cm",
            f"Target weight: {current_user.target_weight_kg} kg",
            f"Activity level: {current_user.activity_level}",
            f"Goal: {current_user.goal}",
            f"Diet preference: {current_user.diet_preference}",
            (
                "Medical conditions: "
                f"{current_user.medical_conditions}"
            ),
            (
                "Food allergies: "
                f"{current_user.food_allergies}"
            ),
            f"Bio: {current_user.bio}",
        ]

        # --------------------------------------------------------
        # Weight records
        # --------------------------------------------------------

        weights = weight_repository.list(
            db=db,
            user_id=current_user.id,
            skip=0,
            limit=5,
            sort="desc",
        )

        weight_lines = []

        for weight in weights:

            weight_lines.append(
                f"- ID: {weight.id}\n"
                f"  Weight: {weight.weight_kg} kg\n"
                f"  Date: {weight.recorded_at}\n"
                f"  Notes: {weight.notes}"
            )

        weight_context = (
            "\n".join(weight_lines)
            if weight_lines
            else "No weight records."
        )

        # --------------------------------------------------------
        # Nutrition records
        # --------------------------------------------------------

        nutrition_context = (
            self._build_nutrition_context(
                db=db,
                user_id=current_user.id,
            )
        )

        # --------------------------------------------------------
        # Final context
        # --------------------------------------------------------

        return f"""
================ CURRENT DATE AND TIME ================

Timezone: {self.DEFAULT_TIMEZONE}
Local datetime: {now.isoformat()}
Local date: {now.date().isoformat()}

================ USER PROFILE ================

{chr(10).join(profile_lines)}

================ RECENT WEIGHT RECORDS ================

{weight_context}

================ RECENT NUTRITION RECORDS ================

{nutrition_context}
""".strip()

    # ============================================================
    # NUTRITION CONTEXT
    # ============================================================

    def _build_nutrition_context(
        self,
        db: Session,
        user_id,
    ) -> str:

        try:

            nutrition_records = (
                nutrition_repository.list(
                    db=db,
                    user_id=user_id,
                    skip=0,
                    limit=10,
                    sort="desc",
                )
            )

        except Exception:

            return (
                "Nutrition records are currently unavailable."
            )

        if not nutrition_records:

            return "No nutrition records."

        lines = []

        for nutrition in nutrition_records:

            meal_type = getattr(
                nutrition.meal_type,
                "value",
                nutrition.meal_type,
            )

            lines.append(
                f"- ID: {nutrition.id}\n"
                f"  Food: {nutrition.food_name}\n"
                f"  Quantity: {nutrition.quantity} "
                f"{nutrition.unit}\n"
                f"  Meal: {meal_type}\n"
                f"  Calories: {nutrition.calories}\n"
                f"  Protein: {nutrition.protein_g} g\n"
                f"  Carbs: {nutrition.carbs_g} g\n"
                f"  Fat: {nutrition.fat_g} g\n"
                f"  Fiber: {nutrition.fiber_g} g\n"
                f"  Date: {nutrition.recorded_at}\n"
                f"  Notes: {nutrition.notes}\n"
                f"  Source: {nutrition.source}"
            )

        return "\n".join(lines)


chat_context_service = ChatContextService()