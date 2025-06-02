from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
import uuid

from app.api.deps import SessionDep, CurrentUser
from app.models import NotificationPublic, NotificationsPublic
from app import crud

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=NotificationsPublic)
def list_notifications(session: SessionDep, current_user: CurrentUser):
    notifications = crud.get_notifications_by_user(session, user_id=current_user.id)
    return NotificationsPublic(data=notifications, count=len(notifications))

@router.post("/{notification_id}/read", response_model=NotificationPublic)
def mark_read(notification_id: uuid.UUID, session: SessionDep, current_user: CurrentUser):
    notification = crud.mark_notification_read(session, notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.delete("/{notification_id}")
def delete_notification(notification_id: uuid.UUID, session: SessionDep, current_user: CurrentUser):
    notification = crud.get_notifications_by_user(session, user_id=current_user.id)
    if not any(n.id == notification_id for n in notification):
        raise HTTPException(status_code=404, detail="Notification not found")
    crud.delete_notification(session, notification_id)
    return {"message": "Notification deleted"} 