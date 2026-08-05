from datetime import UTC, datetime, date
from uuid import UUID, uuid4
from sqlalchemy import Date

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    String,
    Float,
    text,
    true,
    false,
    Text
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.weight import WeightEntry

from app.core.database import Base
from app.models.enums import AuthProvider, Gender, DietPreference, Goal, ActivityLevel


class User(Base):
    __tablename__ = "users"
    
    def __repr__(self) -> str:
        return (
            f"User("
            f"id={self.id}, "
            f"email='{self.email}', "
            f"full_name='{self.full_name}'"
            f")"
        )
    
    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    
    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    
    email: Mapped[str] = mapped_column(
        String(255),
        index=True,
        unique=True,
        nullable=False
    )
    
    hashed_password: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )
    
    auth_provider: Mapped[AuthProvider] = mapped_column(
        Enum(
            AuthProvider,
            values_callable=lambda enum: [member.value for member in enum],
            name="auth_provider",
        ),
        default=AuthProvider.LOCAL,
        server_default=text("'local'"),
        nullable=False,
    )
    
    google_id: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        nullable=True
    )
    
    profile_picture: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=true(),
        nullable=False,
    )
    
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False
    )
    
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        server_default=false()
    )
    
    gender: Mapped[Gender | None] = mapped_column(
        Enum(
            Gender,
            values_callable = lambda enum: [gender.value for gender in enum],
            name="gender"
        ),
        nullable=True
    )
    
    date_of_birth: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )
    
    height_cm: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )
    
    target_weight_kg: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )
    
    activity_level: Mapped[ActivityLevel | None] = mapped_column(
        Enum(
            ActivityLevel,
            values_callable = lambda enum: [activity.value for activity in enum],
            name="activity_level"
        ),
        nullable=True
    )
    
    goal: Mapped[Goal | None] = mapped_column(
        Enum(
            Goal,
            values_callable = lambda enum: [goal.value for goal in enum],
            name="goal"
        ),
        nullable=True
    )
    
    diet_preference: Mapped[DietPreference | None] = mapped_column(
        Enum(
            DietPreference,
            values_callable=lambda enum: [diet.value for diet in enum],
            name = "diet_preference"
        ),
        nullable=True
    )
    
    medical_conditions: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
    
    food_allergies: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
    
    bio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
    
    weights: Mapped[list["WeightEntry"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )