from typing import Any, List
import logging
from datetime import datetime, timedelta, timezone
from sqlmodel import select

from fastapi import APIRouter, HTTPException, BackgroundTasks
import requests
from app.api.deps import CurrentUser, SessionDep
from app.models import CoreIoTData, User

import numpy as np
from sklearn.linear_model import LinearRegression
import joblib
import os

# Directory to save models
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

router = APIRouter(prefix="/coreiot", tags=["coreiot"])
logger = logging.getLogger(__name__)


def train_user_model(user_id, session, metric_type="temperature"):
    logger.info(f"Training model for user {user_id} and metric {metric_type}")
    # Fetch last N data points for this user
    N = 20
    statement = select(CoreIoTData).order_by(CoreIoTData.timestamp.desc()).limit(N)
    result = session.exec(statement)
    data = result.all()[::-1]  # oldest to newest
    if len(data) < 2:
        return
    values = np.array([getattr(d, metric_type) for d in data]).reshape(-1, 1)
    X = np.arange(len(values)).reshape(-1, 1)
    y = values
    model = LinearRegression()
    model.fit(X, y)
    # Save the model per user and metric
    model_path = os.path.join(MODEL_DIR, f"user_{user_id}_{metric_type}.joblib")
    joblib.dump(model, model_path)
    logger.info(f"Model saved to {model_path}")

@router.get("/coreiot-data", response_model=CoreIoTData)
def get_coreiot_data(
    session: SessionDep, current_user: CurrentUser, background_tasks: BackgroundTasks
) -> Any:
    """
    Get latest sensor data from CoreIoT
    """
    if not current_user.coreiot_access_token:
        logger.error("CoreIoT access token not set for user.")
        raise HTTPException(status_code=400, detail="CoreIoT access token not set for user.")
    headers = {
        'X-Authorization': f'Bearer {current_user.coreiot_access_token}'
    }
    try:
        entityType = 'DEVICE'
        entityId = '3c4f5c80-f790-11ef-a887-6d1a184f2bb5'
        api = f'/api/plugins/telemetry/{entityType}/{entityId}/values/timeseries?keys=humidity%2Ctemperature&useStrictDataTypes=false'
        url = f'https://app.coreiot.io{api}'
        
        logger.info(f"Fetching data from CoreIoT: {url}")
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Received data from CoreIoT: {data}")
            
            # Extract the latest values
            if 'temperature' not in data or 'humidity' not in data:
                logger.error(f"Missing temperature or humidity data in response: {data}")
                raise HTTPException(
                    status_code=500,
                    detail="Invalid data format from CoreIoT"
                )
                
            if not data['temperature'] or not data['humidity']:
                logger.error("No temperature or humidity data available")
                raise HTTPException(
                    status_code=404,
                    detail="No sensor data available"
                )
                
            latest_data = CoreIoTData(
                temperature=float(data['temperature'][-1]['value']),
                humidity=float(data['humidity'][-1]['value']),
                timestamp=datetime.fromtimestamp(data['temperature'][-1]['ts'] / 1000, tz=timezone.utc)  # UTC-aware datetime
            )

            session.add(latest_data)
            session.commit()
            session.refresh(latest_data)

            # Check if at least 1 minute has passed since last training
            user = session.get(User, current_user.id)
            now = datetime.now(timezone.utc)
            if not user.last_trained_at or (now - user.last_trained_at) >= timedelta(minutes=1):
                # Schedule background training for both metrics
                def background_train():
                    # Use a new session in the background task
                    with session.bind.connect() as conn:
                        with SessionDep.__origin__(conn) as bg_session:
                            train_user_model(user.id, bg_session, "temperature")
                            train_user_model(user.id, bg_session, "humidity")
                            user.last_trained_at = now
                            bg_session.add(user)
                            bg_session.commit()
                
                logger.info(f"Scheduling background training for user {user.id}")
                background_tasks.add_task(background_train)
            return latest_data
        else:
            logger.error(f"CoreIoT API error: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to fetch data from CoreIoT: {response.text}"
            )
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error connecting to CoreIoT: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail=f"Error connecting to CoreIoT: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/daily-data", response_model=List[CoreIoTData])
def get_daily_data(
    type: str,
    session: SessionDep
):
    """
    Get daily data for a specific type (temperature or humidity)
    """
    if type not in ["temperature", "humidity"]:
        raise HTTPException(status_code=400, detail="Type must be either 'temperature' or 'humidity'")
    
    statement = select(CoreIoTData).where(
        CoreIoTData.timestamp >= datetime.now() - timedelta(days=1)
    ).order_by(CoreIoTData.timestamp.asc())  # Order by timestamp ascending for proper chart display
    
    result = session.exec(statement)
    return result.all()

# pseudo code for alarm and turn on/off the fan
# if temp > thres, show alarm on screen and find ways to send request to activate rpc function
# if temp < thres, turn off the fan and hide the alarm

@router.post("/control-fan")
def control_fan(
    session: SessionDep,
    current_user: CurrentUser,
    turn_on: bool
):
    """
    Control the fan
    """
    try:
        deviceId = '7af4ea90-e89f-11ef-87b5-21bccf7d29d5'
        rpc_api = f'https://app.coreiot.io/api/rpc/oneway/{deviceId}'
        
        logger.info(f"Sending fan control command: {'on' if turn_on else 'off'}")
        response = requests.post(
            rpc_api, 
            headers=headers, 
            json={"method": "setFanState", "params": turn_on}
        )
        
        if response.status_code == 200:
            logger.info(f"Fan control command sent successfully: {response.json()}")
            return {"status": "success", "message": f"Fan turned {'on' if turn_on else 'off'}"}
        else:
            logger.error(f"Failed to control fan: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to control fan: {response.text}"
            )
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error controlling fan: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail=f"Error connecting to CoreIoT: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error controlling fan: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/predict-next")
def predict_next_metric(
    type: str,
    session: SessionDep,
    current_user: CurrentUser
):
    """
    Predict the next value for a metric (temperature or humidity) for the current user.
    """
    if type not in ["temperature", "humidity"]:
        raise HTTPException(status_code=400, detail="Type must be either 'temperature' or 'humidity'")
    # Load the model
    model_path = os.path.join(MODEL_DIR, f"user_{current_user.id}_{type}.joblib")
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail="Model not trained yet. Please wait for more data.")
    model = joblib.load(model_path)
    # Fetch last N data points
    N = 20
    statement = select(CoreIoTData).order_by(CoreIoTData.timestamp.desc()).limit(N)
    result = session.exec(statement)
    data = result.all()[::-1]  # oldest to newest
    if len(data) < 2:
        raise HTTPException(status_code=400, detail="Not enough data to predict")
    values = np.array([getattr(d, type) for d in data]).reshape(-1, 1)
    next_x = np.array([[len(values)]])
    next_value = model.predict(next_x)[0][0]
    logger.info(f"Predicted next {type} value: {next_value}")
    return {"predicted_next": next_value}