from datetime import date
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import SortOrder
from app.models.nutrition import NutritionLog


class NutritionRepository:

    def daily_summary(
        self,
        db: Session,
        user_id: UUID,
        start_date: date,
        end_date: date,
    ) -> list[dict]:
        statement = (
            select(
                NutritionLog.recorded_at.label("recorded_at"),
                func.count(NutritionLog.id).label("entries"),
                func.coalesce(func.sum(NutritionLog.calories), 0).label("calories"),
                func.coalesce(func.sum(NutritionLog.protein_g), 0).label("protein_g"),
                func.coalesce(func.sum(NutritionLog.carbs_g), 0).label("carbs_g"),
                func.coalesce(func.sum(NutritionLog.fat_g), 0).label("fat_g"),
                func.coalesce(func.sum(NutritionLog.fiber_g), 0).label("fiber_g"),
            )
            .where(
                NutritionLog.user_id == user_id,
                NutritionLog.recorded_at >= start_date,
                NutritionLog.recorded_at <= end_date,
            )
            .group_by(NutritionLog.recorded_at)
            .order_by(NutritionLog.recorded_at.asc())
        )
        return [dict(row._mapping) for row in db.execute(statement)]

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
