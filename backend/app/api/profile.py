from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.profile import (
    ProfileResponse,
    ProfileUpdateRequest,
)
from app.services.profile_service import (
    profile_service,
)

# Change this import to your existing auth dependency
from app.dependencies import get_current_user


router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


# ============================================================
# GET PROFILE
# ============================================================

@router.get(
    "",
    response_model=ProfileResponse,
)
def get_profile(
    current_user: User = Depends(
        get_current_user
    ),
):

    return profile_service.get_profile(
        current_user=current_user,
    )


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.patch(
    "",
    response_model=ProfileResponse,
)
def update_profile(
    request: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    return profile_service.update_profile(
        db=db,
        current_user=current_user,
        request=request,
    )