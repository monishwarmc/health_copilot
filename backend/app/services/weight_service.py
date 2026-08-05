from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.logging import logger
from app.models.user import User
from app.models.weight import WeightEntry
from app.repositories.weight_repository import weight_repository
from app.schemas.weight import (
    WeightCreateRequest,
    WeightUpdateRequest,
    WeightResponse,
    WeightListResponse,
    WeightStatsResponse
)

from app.schemas.auth import MessageResponse
from app.exceptions.weight import (
    ResourceNotFoundException,
    ResourceAccessDeniedException
)
from app.models.enums import SortOrder


class WeightService:
    def create(
        self,
        db: Session,
        request: WeightCreateRequest,
        current_user: User,
    ) -> WeightResponse:

        weight = WeightEntry(
            user_id=current_user.id,
            weight_kg=request.weight_kg,
            notes=request.notes,
            recorded_at=request.recorded_at or date.today(),
        )

        weight = weight_repository.create(
            db=db,
            weight=weight,
        )

        logger.info(
            "Weight recorded: %s",
            current_user.email,
        )

        return WeightResponse.model_validate(weight)
  
    def list(
        self,
        db: Session,
        current_user: User,
        page: int,
        limit: int,
        sort: SortOrder,
    ) -> WeightListResponse:

        skip = (page - 1) * limit

        weights = weight_repository.list(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        sort=sort
        )

        total = weight_repository.count(
        db=db,
        user_id=current_user.id,
        )

        return WeightListResponse(
        items=[
            WeightResponse.model_validate(weight)
            for weight in weights
        ],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
        )
    
    def latest(
        self,
        db: Session,
        current_user: User,
    ) -> WeightResponse:

        weight = weight_repository.get_latest(
        db=db,
        user_id=current_user.id,
        )
        if weight is None:
            raise ResourceNotFoundException("Weight entry")
        logger.info(
            "Retrieved latest weight: %s",
            current_user.email,
        )

        return WeightResponse.model_validate(weight)
      
    def update(
        self,
        db: Session,
        request: WeightUpdateRequest,
        current_user: User,
        weight_id: UUID,
    ) -> WeightResponse:

        weight = weight_repository.get_by_id(
        db=db,
        weight_id=weight_id,
        )

        if weight is None:
            raise ResourceNotFoundException("weight entry")
        if weight.user_id != current_user.id:
            raise ResourceAccessDeniedException("weight entry")
        data = request.model_dump(
        exclude_unset=True,
        )

        for field, value in data.items():
            setattr(
                weight,
                field,
                value,
            )

        weight_repository.update(
        db=db,
        weight=weight,
        )

        logger.info(
        "Weight updated: %s",
        current_user.email,
        )

        return WeightResponse.model_validate(weight)
  
    def delete(
        self,
        db: Session,
        current_user: User,
        weight_id: UUID,
    ) -> MessageResponse:

        weight = weight_repository.get_by_id(
            db=db,
            weight_id=weight_id,
        )

        if weight is None:
            raise ResourceNotFoundException("weight entry")

        if weight.user_id != current_user.id:
            raise ResourceAccessDeniedException("weight entry")

        weight_repository.delete(
            db=db,
            weight=weight,
        )

        logger.info(
            "Weight deleted: %s",
            current_user.email,
        )

        return MessageResponse(
            message="Weight entry deleted."
        )
        
    def stats(
        self,
        db: Session,
        current_user: User,
    ) -> WeightStatsResponse:

        latest = weight_repository.get_latest(
            db=db,
            user_id=current_user.id,
        )

        first = weight_repository.get_first(
            db=db,
            user_id=current_user.id,
        )

        total = weight_repository.count(
            db=db,
            user_id=current_user.id,
        )

        current_weight = latest.weight_kg if latest else None
        starting_weight = first.weight_kg if first else None
        target_weight = current_user.target_weight_kg

        weight_change = None

        if current_weight is not None and starting_weight is not None:
            weight_change = current_weight - starting_weight

        remaining_to_goal = None
        if current_weight is not None and target_weight is not None:
            remaining_to_goal = current_weight - target_weight
            
        goal_progress_percent = None

        if (
            current_weight is not None
            and starting_weight is not None
            and target_weight is not None
            and starting_weight != target_weight
        ):
            goal_progress_percent = (
                (starting_weight - current_weight)
                / (starting_weight - target_weight)
            ) * 100

            goal_progress_percent = max(
                0,
                min(goal_progress_percent, 100),
            )

        logger.info(
            "Weight stats retrieved: %s",
            current_user.email,
        )
        
        return WeightStatsResponse(
            current_weight=current_weight,
            starting_weight=starting_weight,
            target_weight=target_weight,
            weight_change=weight_change,
            remaining_to_goal=remaining_to_goal,
            goal_progress_percent=goal_progress_percent,
            entries=total,
            latest_recorded_at=latest.recorded_at if latest else None,
        )
    
weight_service = WeightService()