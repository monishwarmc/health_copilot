from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import SortOrder
from app.models.nutrition import NutritionLog


class NutritionRepository:

    def create(
        self,
        db: Session,
        nutrition: NutritionLog,
    ) -> NutritionLog:

        db.add(nutrition)

        db.commit()

        db.refresh(nutrition)

        return nutrition

    def get_by_id(
        self,
        db: Session,
        nutrition_id: UUID,
    ) -> NutritionLog | None:

        statement = (
            select(NutritionLog)
            .where(
                NutritionLog.id
                == nutrition_id
            )
        )

        return db.scalar(statement)

    def list(
        self,
        db: Session,
        user_id: UUID,
        skip: int,
        limit: int,
        sort: SortOrder,
    ) -> list[NutritionLog]:

        if sort == SortOrder.ASC:

            order = (
                NutritionLog.recorded_at.asc(),
                NutritionLog.created_at.asc(),
            )

        else:

            order = (
                NutritionLog.recorded_at.desc(),
                NutritionLog.created_at.desc(),
            )

        statement = (
            select(NutritionLog)
            .where(
                NutritionLog.user_id
                == user_id
            )
            .order_by(*order)
            .offset(skip)
            .limit(limit)
        )

        return list(
            db.scalars(statement)
        )

    def count(
        self,
        db: Session,
        user_id: UUID,
    ) -> int:

        statement = (
            select(func.count())
            .select_from(
                NutritionLog
            )
            .where(
                NutritionLog.user_id
                == user_id
            )
        )

        return (
            db.scalar(statement)
            or 0
        )

    def update(
        self,
        db: Session,
        nutrition: NutritionLog,
    ) -> NutritionLog:

        db.commit()

        db.refresh(nutrition)

        return nutrition

    def delete(
        self,
        db: Session,
        nutrition: NutritionLog,
    ) -> None:

        db.delete(nutrition)

        db.commit()


nutrition_repository = NutritionRepository()