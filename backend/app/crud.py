import uuid
from typing import Any

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import Item, ItemCreate, User, UserCreate, UserUpdate, Alarm, AlarmCreate, AlarmUpdate, Notification, NotificationCreate


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def create_alarm(*, session: Session, alarm_create: AlarmCreate, user_id: uuid.UUID) -> Alarm:
    db_obj = Alarm.model_validate(alarm_create, update={"user_id": user_id})
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_alarm(session: Session, alarm_id: uuid.UUID) -> Alarm | None:
    return session.get(Alarm, alarm_id)


def get_alarms_by_user(session: Session, user_id: uuid.UUID) -> list[Alarm]:
    statement = select(Alarm).where(Alarm.user_id == user_id)
    return session.exec(statement).all()


def update_alarm(*, session: Session, db_alarm: Alarm, alarm_in: AlarmUpdate) -> Alarm:
    alarm_data = alarm_in.model_dump(exclude_unset=True)
    db_alarm.sqlmodel_update(alarm_data)
    session.add(db_alarm)
    session.commit()
    session.refresh(db_alarm)
    return db_alarm


def delete_alarm(session: Session, db_alarm: Alarm) -> None:
    session.delete(db_alarm)
    session.commit()


def create_notification(*, session: Session, notification_create: NotificationCreate) -> Notification:
    db_obj = Notification.model_validate(notification_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_notifications_by_user(session: Session, user_id: uuid.UUID) -> list[Notification]:
    statement = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
    return session.exec(statement).all()


def mark_notification_read(session: Session, notification_id: uuid.UUID) -> Notification | None:
    notification = session.get(Notification, notification_id)
    if notification:
        notification.is_read = True
        session.add(notification)
        session.commit()
        session.refresh(notification)
    return notification


def mark_all_notifications_read(session: Session, user_id: uuid.UUID) -> None:
    statement = select(Notification).where(Notification.user_id == user_id)
    notifications = session.exec(statement).all()
    for notification in notifications:
        notification.is_read = True
        session.add(notification)
    session.commit()

def delete_notification(session: Session, notification_id: uuid.UUID) -> None:
    notification = session.get(Notification, notification_id)
    if notification:
        session.delete(notification)
        session.commit()
