import uuid
from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    coreiot_access_token: str | None = None  # New field for CoreIoT access token


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)
    coreiot_access_token: str | None = None


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)
    coreiot_access_token: str | None = None


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)
    coreiot_access_token: str | None = None
    last_trained_at: datetime | None = Field(default=None, nullable=True)  # Track last model training time


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    coreiot_access_token: str | None = None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


class CoreIoTData(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    temperature: float
    humidity: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now)


class AlarmBase(SQLModel):
    type: str = Field(description="Type of alarm: 'temperature' or 'humidity'")
    threshold_type: str = Field(description="'above' or 'below'")
    value: float = Field(description="Threshold value")
    is_active: bool = Field(default=True)


class AlarmCreate(AlarmBase):
    pass


class AlarmUpdate(SQLModel):
    type: str | None = None
    threshold_type: str | None = None
    value: float | None = None
    is_active: bool | None = None


class Alarm(AlarmBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    user: User | None = Relationship()
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AlarmPublic(AlarmBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class AlarmsPublic(SQLModel):
    data: list[AlarmPublic]
    count: int


class NotificationBase(SQLModel):
    message: str
    is_read: bool = False
    alarm_id: uuid.UUID | None = None


class NotificationCreate(NotificationBase):
    user_id: uuid.UUID
    alarm_id: uuid.UUID | None = None


class Notification(NotificationBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    alarm_id: uuid.UUID | None = Field(default=None, foreign_key="alarm.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NotificationPublic(NotificationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    alarm_id: uuid.UUID | None = None
    created_at: datetime


class NotificationsPublic(SQLModel):
    data: list[NotificationPublic]
    count: int