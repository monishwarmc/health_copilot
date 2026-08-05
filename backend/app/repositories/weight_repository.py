from uuid import UUID

from sqlalchemy import select, func, asc, desc
from sqlalchemy.orm import Session

from app.models.weight import WeightEntry
from app.models.enums import SortOrder

class WeightRepository:

    def create(
        self,
        db: Session,
        weight: WeightEntry,
    ) -> WeightEntry:

        db.add(weight)
        db.commit()
        db.refresh(weight)

        return weight

    def get_by_id(
        self,
        db: Session,
        weight_id: UUID,
    ) -> WeightEntry | None:

        statement = (
            select(WeightEntry)
            .where(WeightEntry.id == weight_id)
        )

        return db.scalar(statement)

    def get_latest(
        self,
        db: Session,
        user_id: UUID,
    ) -> WeightEntry | None:

        statement = (
            select(WeightEntry)
            .where(WeightEntry.user_id == user_id)
            .order_by(
                WeightEntry.recorded_at.desc(),
                WeightEntry.created_at.desc(),
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
    ) -> list[WeightEntry]:

        order = (
            (
                WeightEntry.recorded_at.asc(),
                WeightEntry.created_at.asc(),
            )
            if sort == SortOrder.ASC
            else (
                WeightEntry.recorded_at.desc(),
                WeightEntry.created_at.desc(),
            )
        )

        statement = (
            select(WeightEntry)
            .where(WeightEntry.user_id == user_id)
            .order_by(*order)
            .offset(skip)
            .limit(limit)
        )

        return list(db.scalars(statement))


    def count(
        self,
        db: Session,
        user_id: UUID,
    ) -> int:

        statement = (
            select(func.count())
            .select_from(WeightEntry)
            .where(WeightEntry.user_id == user_id)
        )

        return db.scalar(statement) or 0

    def update(
        self,
        db: Session,
        weight: WeightEntry,
    ) -> WeightEntry:

        db.commit()
        db.refresh(weight)

        return weight

    def delete(
        self,
        db: Session,
        weight: WeightEntry,
    ) -> None:

        db.delete(weight)
        db.commit()
        
    def get_first(
        self,
        db: Session,
        user_id: UUID,
    ) -> WeightEntry | None:

        statement = (
            select(WeightEntry)
            .where(WeightEntry.user_id == user_id)
            .order_by(
                WeightEntry.recorded_at.asc(),
                WeightEntry.created_at.asc(),
            )
        )

        return db.scalar(statement)


weight_repository = WeightRepository()