from datetime import UTC, date, datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    String,
    Text,
    false,
    text,
    true,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import (
    ActivityLevel,
    AuthProvider,
    DietPreference,
    Gender,
    Goal,
)
from app.models.weight import WeightEntry


if TYPE_CHECKING:
    from app.models.chat import ChatConversation
    from app.models.nutrition import NutritionLog


class User(Base):

    __tablename__ = "users"

    # ============================================================
    # REPRESENTATION
    # ============================================================

    def __repr__(self) -> str:
        return (
            f"User("
            f"id={self.id}, "
            f"email='{self.email}', "
            f"full_name='{self.full_name}'"
            f")"
        )

    # ============================================================
    # ID
    # ============================================================

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    # ============================================================
    # BASIC USER INFORMATION
    # ============================================================

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        index=True,
        unique=True,
        nullable=False,
    )

    hashed_password: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # ============================================================
    # AUTHENTICATION
    # ============================================================

    auth_provider: Mapped[AuthProvider] = mapped_column(
        Enum(
            AuthProvider,
            values_callable=lambda enum: [
                member.value
                for member in enum
            ],
            name="auth_provider",
        ),
        default=AuthProvider.LOCAL,
        server_default=text("'local'"),
        nullable=False,
    )

    google_id: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        nullable=True,
    )

    # ============================================================
    # PROFILE
    # ============================================================

    profile_picture: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    gender: Mapped[Gender | None] = mapped_column(
        Enum(
            Gender,
            values_callable=lambda enum: [
                member.value
                for member in enum
            ],
            name="gender",
        ),
        nullable=True,
    )

    date_of_birth: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    height_cm: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    target_weight_kg: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    activity_level: Mapped[ActivityLevel | None] = mapped_column(
        Enum(
            ActivityLevel,
            values_callable=lambda enum: [
                member.value
                for member in enum
            ],
            name="activity_level",
        ),
        nullable=True,
    )

    goal: Mapped[Goal | None] = mapped_column(
        Enum(
            Goal,
            values_callable=lambda enum: [
                member.value
                for member in enum
            ],
            name="goal",
        ),
        nullable=True,
    )

    diet_preference: Mapped[DietPreference | None] = mapped_column(
        Enum(
            DietPreference,
            values_callable=lambda enum: [
                member.value
                for member in enum
            ],
            name="diet_preference",
        ),
        nullable=True,
    )

    medical_conditions: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    food_allergies: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    bio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ============================================================
    # ACCOUNT STATUS
    # ============================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=true(),
        nullable=False,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default=false(),
        nullable=False,
    )

    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ============================================================
    # TIMESTAMPS
    # ============================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )

    # ============================================================
    # WEIGHT RELATIONSHIP
    # ============================================================

    weights: Mapped[list["WeightEntry"]] = relationship(
        "WeightEntry",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # ============================================================
    # NUTRITION RELATIONSHIP
    # ============================================================

    nutrition_logs: Mapped[list["NutritionLog"]] = relationship(
        "NutritionLog",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # ============================================================
    # CHAT RELATIONSHIP
    # ============================================================

    chat_conversations: Mapped[list["ChatConversation"]] = relationship(
        "ChatConversation",
        back_populates="user",
        cascade="all, delete-orphan",
    )