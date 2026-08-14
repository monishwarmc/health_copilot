from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.enums import SortOrder
from app.models.user import User
from app.schemas.auth import MessageResponse
from app.schemas.nutrition import (
    FoodSearchResponse,
    NutritionCreateRequest,
    NutritionListResponse,
    NutritionResponse,
    NutritionUpdateRequest,
)
from app.services.nutrition_service import (
    nutrition_service,
)


router = APIRouter(
    prefix="/nutrition",
    tags=["Nutrition"],
)


# ============================================================
# USDA FOOD SEARCH
# ============================================================


@router.get(
    "/search",
    response_model=FoodSearchResponse,
)
def search_food(
    q: str = Query(
        min_length=2,
        max_length=100,
    ),
    current_user: User = Depends(
        get_current_user
    ),
) -> FoodSearchResponse:

    return nutrition_service.search(
        query=q,
    )


# ============================================================
# CREATE NUTRITION LOG
# ============================================================


@router.post(
    "",
    response_model=NutritionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_nutrition(
    request: NutritionCreateRequest,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
) -> NutritionResponse:

    return nutrition_service.create(
        db=db,
        request=request,
        current_user=current_user,
    )


# ============================================================
# LIST NUTRITION LOGS
# ============================================================


@router.get(
    "",
    response_model=NutritionListResponse,
)
def list_nutrition(
    page: int = Query(
        default=1,
        ge=1,
    ),

    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),

    sort: SortOrder = Query(
        default=SortOrder.DESC,
    ),

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
) -> NutritionListResponse:

    return nutrition_service.list(
        db=db,
        current_user=current_user,
        page=page,
        limit=limit,
        sort=sort,
    )


# ============================================================
# UPDATE
# ============================================================


@router.patch(
    "/{nutrition_id}",
    response_model=NutritionResponse,
)
def update_nutrition(
    nutrition_id: UUID,

    request: NutritionUpdateRequest,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
) -> NutritionResponse:

    return nutrition_service.update(
        db=db,
        request=request,
        current_user=current_user,
        nutrition_id=nutrition_id,
    )


# ============================================================
# DELETE
# ============================================================


@router.delete(
    "/{nutrition_id}",
    response_model=MessageResponse,
)
def delete_nutrition(
    nutrition_id: UUID,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
) -> MessageResponse:

    return nutrition_service.delete(
        db=db,
        current_user=current_user,
        nutrition_id=nutrition_id,
    )