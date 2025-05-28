import uuid
from typing import Any
import logging

from fastapi import APIRouter, HTTPException, Depends
import requests
from app.api.deps import CurrentUser, SessionDep
from app.models import Item, ItemCreate, ItemPublic, ItemsPublic, ItemUpdate, Message, CoreIoTData

router = APIRouter(prefix="/coreiot", tags=["coreiot"])
logger = logging.getLogger(__name__)

coreiot_jwt_token = {
    'access_token': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJraGFuaC5tYWkxNjA4MDNAaGNtdXQuZWR1LnZuIiwidXNlcklkIjoiMzU1MmQ2MDAtZTg5Zi0xMWVmLTg3YjUtMjFiY2NmN2QyOWQ1Iiwic2NvcGVzIjpbIlRFTkFOVF9BRE1JTiJdLCJzZXNzaW9uSWQiOiJmMWE0ZjYxYi0xODM0LTRiM2EtODQ4NC0wMjBhMTZkMTVhNDQiLCJleHAiOjE3NDg0NTgwNzcsImlzcyI6ImNvcmVpb3QuaW8iLCJpYXQiOjE3NDg0NDkwNzcsImZpcnN0TmFtZSI6IktIw4FOSCIsImxhc3ROYW1lIjoiTUFJIFTDlE4gxJDEgk5HIiwiZW5hYmxlZCI6dHJ1ZSwiaXNQdWJsaWMiOmZhbHNlLCJ0ZW5hbnRJZCI6IjM1NDVkZGIwLWU4OWYtMTFlZi04N2I1LTIxYmNjZjdkMjlkNSIsImN1c3RvbWVySWQiOiIxMzgxNDAwMC0xZGQyLTExYjItODA4MC04MDgwODA4MDgwODAifQ.e9Mh02d070qxjQjeybiF5u7zJHDG5GRA7a0fwy-YNi8WQS_9p5t8QXlysZxaWUvpJGMKr4SSEwf_HTSAGYG1kw',
    'type': 'Bearer'
}
 
headers = {
    'Authorization': f'{coreiot_jwt_token["type"]} {coreiot_jwt_token["access_token"]}',
    'Content-Type': 'application/json'
}

@router.get("/coreiot-data", response_model=CoreIoTData)
def get_coreiot_data(
    session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get latest sensor data from CoreIoT
    """
    try:
        entityType = 'DEVICE'
        entityId = '7af4ea90-e89f-11ef-87b5-21bccf7d29d5'
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
                humidity=float(data['humidity'][-1]['value'])
            )
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

