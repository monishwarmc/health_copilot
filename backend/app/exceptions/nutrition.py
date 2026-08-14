from fastapi import status

from app.exceptions.base import AppException


class NutritionProviderConfigurationException(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Nutrition provider is not configured.",
        )


class NutritionProviderException(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Nutrition provider is currently unavailable.",
        )


class NutritionFoodNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food not found.",
        )


class UnsupportedNutritionUnitException(AppException):
    def __init__(self, unit: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unit '{unit}' is not currently supported for nutrition calculation.",
        )


class NutritionSnapshotUnavailableException(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="Nutrition cannot be recalculated for this legacy food entry.",
        )