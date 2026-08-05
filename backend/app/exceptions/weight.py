from fastapi import status

from app.exceptions.base import AppException


class ResourceNotFoundException(AppException):
    def __init__(self, resource: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} not found.",
        )


class ResourceAccessDeniedException(AppException):
    def __init__(self, resource: str):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You do not have permission to access this {resource.lower()}.",
        )