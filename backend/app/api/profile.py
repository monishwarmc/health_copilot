from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.user import User
from app.dependencies import get_current_user
from app.services.profile_service import profile_service
from app.schemas.profile import ProfileUpdateRequest, ProfileResponse
from app.core.database import get_db


router = APIRouter(
  prefix="/profile",
  tags=["Profile"]
)

@router.get(
  "",
  response_model=ProfileResponse
)
def get_profile(
  current_user: User = Depends(get_current_user)
)-> ProfileResponse:
  return profile_service.get_profile(
    current_user=current_user
  )
  
@router.patch(
  "",
  response_model=ProfileResponse
)
def update(
  request: ProfileUpdateRequest,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
)-> ProfileResponse:
  return profile_service.update_profile(
    request=request,
    db=db,
    current_user=current_user
  )
  