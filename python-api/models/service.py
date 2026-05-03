# from typing import final
# import uuid
# import datetime
#
# from sqlalchemy import (
#     Boolean,
#     Column,
#     DateTime,
#     ForeignKey,
#     Index,
#     Numeric,
#     String,
#     text,
# )
# from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import DeclarativeBase, relationship
#
#
# class Base(DeclarativeBase):
#     pass
#
#
# @final
# class User(Base):
#     __tablename__ = "users"
#
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     first_name = Column(String, nullable=False)
#     last_name = Column(String, nullable=False)
#     email = Column(String, nullable=True)
#     primary_guardian_id = Column(
#         UUID(as_uuid=True),
#         ForeignKey("users.id", ondelete="CASCADE"),
#         nullable=True,
#     )
#
#     created_at = Column(
#         DateTime(timezone=True), nullable=False, server_default=text("NOW()")
#     )
#     updated_at = Column(
#         DateTime(timezone=True),
#         nullable=False,
#         server_default=text("NOW()"),
#         onupdate=datetime.datetime.now(datetime.timezone.utc),
#     )
#
#     # Self-referential relationship: guardian -> dependants
#     primary_guardian = relationship(
#         "User", remote_side="User.id", back_populates="dependants"
#     )
#     dependants = relationship("User", back_populates="primary_guardian")
#
#     payments = relationship("Payment", back_populates="user")
#     payment_items_for = relationship("PaymentItem", back_populates="for_user")
#
#
# @final
# class School(Base):
#     __tablename__ = "schools"
#
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     name = Column(String, nullable=False)
#
#     created_at = Column(
#         DateTime(timezone=True), nullable=False, server_default=text("NOW()")
#     )
#     updated_at = Column(
#         DateTime(timezone=True),
#         nullable=False,
#         server_default=text("NOW()"),
#         onupdate=datetime.datetime.now(datetime.timezone.utc),
#     )
#
#     trips = relationship("Trip", back_populates="school")
#
#
# @final
# class Trip(Base):
#     __tablename__ = "trips"
#
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     name = Column(String, nullable=False)
#     cost = Column(Numeric(10, 2), nullable=False)
#     start_datetime = Column(DateTime(timezone=True), nullable=False)
#     end_datetime = Column(DateTime(timezone=True), nullable=False)
#     school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False)
#
#     created_at = Column(
#         DateTime(timezone=True), nullable=False, server_default=text("NOW()")
#     )
#     updated_at = Column(
#         DateTime(timezone=True),
#         nullable=False,
#         server_default=text("NOW()"),
#         onupdate=datetime.datetime.now(datetime.timezone.utc),
#     )
#
#     school = relationship("School", back_populates="trips")
#
#
# @final
# class Payment(Base):
#     __tablename__ = "payments"
#
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     amount = Column(Numeric(10, 2), nullable=True)
#     receipt_sent = Column(Boolean, nullable=True)
#     user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
#
#     created_at = Column(
#         DateTime(timezone=True), nullable=False, server_default=text("NOW()")
#     )
#     updated_at = Column(
#         DateTime(timezone=True),
#         nullable=False,
#         server_default=text("NOW()"),
#         onupdate=datetime.datetime.now(datetime.timezone.utc),
#     )
#
#     user = relationship("User", back_populates="payments")
#     items = relationship("PaymentItem", back_populates="payment")
#
#
# @final
# class PaymentItem(Base):
#     __tablename__ = "payment_items"
#
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     type = Column(String, nullable=False)
#     payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id"), nullable=False)
#     for_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
#     # No FK constraint on for_item_id - intentionally polymorphic (could reference trips or future types)
#     for_item_id = Column(UUID(as_uuid=True), nullable=False)
#
#     created_at = Column(
#         DateTime(timezone=True), nullable=False, server_default=text("NOW()")
#     )
#     updated_at = Column(
#         DateTime(timezone=True),
#         nullable=False,
#         server_default=text("NOW()"),
#         onupdate=datetime.datetime.now(datetime.timezone.utc),
#     )
#
#     payment = relationship("Payment", back_populates="items")
#     for_user = relationship("User", back_populates="payment_items_for")
#
#     __table_args__ = (
#         Index("ix_payment_items_type_for_item_id", "type", "for_item_id"),
#     )


from typing import final
import uuid
import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


@final
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    primary_guardian_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("NOW()")
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()"),
        onupdate=datetime.datetime.now(datetime.timezone.utc),
    )

    # Self-referential relationship: guardian -> dependants
    primary_guardian: Mapped["User | None"] = relationship(
        "User", remote_side="User.id", back_populates="dependants"
    )
    dependants: Mapped[list["User"]] = relationship(
        "User", back_populates="primary_guardian"
    )

    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="user")
    payment_items_for: Mapped[list["PaymentItem"]] = relationship(
        "PaymentItem", back_populates="for_user"
    )


@final
class School(Base):
    __tablename__ = "schools"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, nullable=False)

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("NOW()")
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()"),
        onupdate=datetime.datetime.now(datetime.timezone.utc),
    )

    trips: Mapped[list["Trip"]] = relationship("Trip", back_populates="school")


@final
class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    cost: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    start_datetime: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    end_datetime: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    school_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("NOW()")
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()"),
        onupdate=datetime.datetime.now(datetime.timezone.utc),
    )

    school: Mapped["School"] = relationship("School", back_populates="trips")


@final
class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    receipt_sent: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("NOW()")
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()"),
        onupdate=datetime.datetime.now(datetime.timezone.utc),
    )

    user: Mapped["User"] = relationship("User", back_populates="payments")
    items: Mapped[list["PaymentItem"]] = relationship(
        "PaymentItem", back_populates="payment"
    )


@final
class PaymentItem(Base):
    __tablename__ = "payment_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    type: Mapped[str] = mapped_column(String, nullable=False)
    payment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("payments.id"), nullable=False
    )
    for_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    # No FK constraint on for_item_id - intentionally polymorphic (could reference trips or future types)
    for_item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("NOW()")
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()"),
        onupdate=datetime.datetime.now(datetime.timezone.utc),
    )

    payment: Mapped["Payment"] = relationship("Payment", back_populates="items")
    for_user: Mapped["User"] = relationship("User", back_populates="payment_items_for")

    __table_args__ = (
        Index("ix_payment_items_type_for_item_id", "type", "for_item_id"),
    )
