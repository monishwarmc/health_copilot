from sqlalchemy.orm import Session

from app.core.logging import logger
from app.models.user import User
from app.repositories.profile_repository import (
    profile_repository,
)
from app.schemas.profile import (
    ProfileResponse,
    ProfileUpdateRequest,
)


class ProfileService:

    # ============================================================
    # GET PROFILE
    # ============================================================

    def get_profile(
        self,
        current_user: User,
    ) -> ProfileResponse:

        return ProfileResponse.model_validate(
            current_user
        )

    # ============================================================
    # UPDATE PROFILE
    # ============================================================

    def update_profile(
        self,
        db: Session,
        current_user: User,
        request: ProfileUpdateRequest,
    ) -> ProfileResponse:

        data = request.model_dump(
            exclude_unset=True,
        )

        for field, value in data.items():

            setattr(
                current_user,
                field,
                value,
            )

        profile_repository.update(
            db=db,
            user=current_user,
        )

        logger.info(
            "Profile updated: %s",
            current_user.email,
        )

        return ProfileResponse.model_validate(
            current_user
        )


profile_service = ProfileService()