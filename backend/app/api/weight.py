from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import MessageResponse
from app.schemas.weight import (
    WeightCreateRequest,
    WeightUpdateRequest,
    WeightResponse,
    WeightListResponse,
    WeightStatsResponse
)
from app.services.weight_service import weight_service
from app.models.enums import SortOrder


router = APIRouter(
  prefix="/weights",
  tags=["Weight"]
)

@router.post(
    "",
    response_model=WeightResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_weight(
    request: WeightCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WeightResponse:
    return weight_service.create(
        db=db,
        request=request,
        current_user=current_user,
    )
    
@router.get(
    "",
    response_model=WeightListResponse,
)
def list_weights(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    sort: SortOrder = Query(default=SortOrder.DESC),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WeightListResponse:
    return weight_service.list(
        db=db,
        current_user=current_user,
        page=page,
        limit=limit,
        sort=sort,
    )

@router.get(
    "/latest",
    response_model=WeightResponse,
)
def latest_weight(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
)-> WeightResponse:
    return weight_service.latest(
        db=db,
        current_user=current_user,
    )
    
@router.patch(
    "/{weight_id}",
    response_model=WeightResponse,
)
def update_weight(
    weight_id: UUID,
    request: WeightUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
)-> WeightResponse:
    return weight_service.update(
        db=db,
        request=request,
        current_user=current_user,
        weight_id=weight_id,
    )
    
@router.delete(
    "/{weight_id}",
    response_model=MessageResponse,
)
def delete_weight(
    weight_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
)-> MessageResponse:
    return weight_service.delete(
        db=db,
        current_user=current_user,
        weight_id=weight_id,
    )
    
@router.get(
    "/stats",
    response_model=WeightStatsResponse,
)
def weight_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WeightStatsResponse:
    return weight_service.stats(
        db=db,
        current_user=current_user,
    )