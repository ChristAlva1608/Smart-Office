from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
import uuid

from app.api.deps import SessionDep, CurrentUser
from app.models import Alarm, AlarmCreate, AlarmUpdate, AlarmPublic, AlarmsPublic
from app import crud

router = APIRouter(prefix="/alarms", tags=["alarms"])

@router.get("/", response_model=AlarmsPublic)
def list_alarms(session: SessionDep, current_user: CurrentUser):
    alarms = crud.get_alarms_by_user(session, user_id=current_user.id)
    return AlarmsPublic(data=alarms, count=len(alarms))

@router.post("/", response_model=AlarmPublic)
def create_alarm(session: SessionDep, alarm_in: AlarmCreate, current_user: CurrentUser):
    alarm = crud.create_alarm(session=session, alarm_create=alarm_in, user_id=current_user.id)
    return alarm

@router.get("/{alarm_id}", response_model=AlarmPublic)
def get_alarm(alarm_id: uuid.UUID, session: SessionDep, current_user: CurrentUser):
    alarm = crud.get_alarm(session, alarm_id)
    if not alarm or alarm.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return alarm

@router.patch("/{alarm_id}", response_model=AlarmPublic)
def update_alarm(alarm_id: uuid.UUID, alarm_in: AlarmUpdate, session: SessionDep, current_user: CurrentUser):
    alarm = crud.get_alarm(session, alarm_id)
    if not alarm or alarm.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Alarm not found")
    alarm = crud.update_alarm(session=session, db_alarm=alarm, alarm_in=alarm_in)
    return alarm

@router.delete("/{alarm_id}")
def delete_alarm(alarm_id: uuid.UUID, session: SessionDep, current_user: CurrentUser):
    alarm = crud.get_alarm(session, alarm_id)
    if not alarm or alarm.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Alarm not found")
    crud.delete_alarm(session, db_alarm=alarm)
    return {"message": "Alarm deleted"} 