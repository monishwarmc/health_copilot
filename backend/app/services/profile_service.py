from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest
from sqlalchemy.orm import Session
from app.repositories.profile_repository import profile_repository
from app.core.logging import logger




class ProfileService:

    def get_profile(
        self,
        current_user: User,
    ) -> ProfileResponse:

        return ProfileResponse.model_validate(
            current_user
        )


    def update_profile(
        self,
        request: ProfileUpdateRequest,
        current_user: User,
        db: Session
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