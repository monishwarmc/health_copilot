from dataclasses import dataclass

import httpx

from app.core.config import settings
from app.exceptions.nutrition import (
    NutritionFoodNotFoundException,
)


USDA_API_URL = (
    "https://api.nal.usda.gov/fdc/v1"
)


@dataclass
class NutritionFood:
    id: str
    name: str

    calories_per_100g: float
    protein_g_per_100g: float
    carbs_g_per_100g: float
    fat_g_per_100g: float
    fiber_g_per_100g: float


class NutritionProvider:

    def __init__(self) -> None:
        self.api_key = settings.USDA_FDC_API_KEY

    def _nutrient_value(
        self,
        food: dict,
        nutrient_id: int,
    ) -> float:

        nutrients = food.get(
            "foodNutrients",
            [],
        )

        for nutrient in nutrients:

            nutrient_data = (
                nutrient.get("nutrient")
                or {}
            )

            current_id = (
                nutrient_data.get("id")
            )

            # Search response can have nutrient
            # information directly on the object.
            if current_id is None:
                current_id = nutrient.get(
                    "nutrientId"
                )

            if current_id == nutrient_id:
                value = nutrient.get(
                    "amount"
                )

                if value is None:
                    value = nutrient.get(
                        "value"
                    )

                if value is not None:
                    return float(value)

        return 0.0

    def _parse_food(
        self,
        food: dict,
    ) -> NutritionFood:

        food_id = str(
            food.get("fdcId")
        )

        name = (
            food.get("description")
            or food.get("lowercaseDescription")
            or "Unknown food"
        )

        return NutritionFood(
            id=food_id,
            name=name,

            # USDA nutrient IDs
            # Energy
            calories_per_100g=self._nutrient_value(
                food,
                1008,
            ),

            # Protein
            protein_g_per_100g=self._nutrient_value(
                food,
                1003,
            ),

            # Carbohydrate
            carbs_g_per_100g=self._nutrient_value(
                food,
                1005,
            ),

            # Total lipid / fat
            fat_g_per_100g=self._nutrient_value(
                food,
                1004,
            ),

            # Fiber
            fiber_g_per_100g=self._nutrient_value(
                food,
                1079,
            ),
        )

    def search_food(
        self,
        query: str,
        page_size: int = 20,
    ) -> list[NutritionFood]:

        params = {
            "api_key": self.api_key,
            "query": query,
            "pageSize": page_size,
        }

        try:
            response = httpx.get(
                f"{USDA_API_URL}/foods/search",
                params=params,
                timeout=15.0,
            )

            response.raise_for_status()

        except httpx.HTTPError as exc:
            raise NutritionFoodNotFoundException(
                "Unable to search USDA FoodData Central."
            ) from exc

        data = response.json()

        foods = data.get(
            "foods",
            [],
        )

        return [
            self._parse_food(food)
            for food in foods
        ]

    def get_food(
        self,
        food_id: str,
    ) -> NutritionFood:

        params = {
            "api_key": self.api_key,
        }

        try:
            response = httpx.get(
                f"{USDA_API_URL}/food/{food_id}",
                params=params,
                timeout=15.0,
            )

            if response.status_code == 404:
                raise NutritionFoodNotFoundException()

            response.raise_for_status()

        except NutritionFoodNotFoundException:
            raise

        except httpx.HTTPError as exc:
            raise NutritionFoodNotFoundException(
                "Unable to retrieve USDA food."
            ) from exc

        food = response.json()

        return self._parse_food(food)


nutrition_provider = NutritionProvider()