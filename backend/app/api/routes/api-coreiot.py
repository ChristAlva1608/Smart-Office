import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select
import requests
from app.api.deps import CurrentUser, SessionDep
from app.models import Item, ItemCreate, ItemPublic, ItemsPublic, ItemUpdate, Message

router = APIRouter(prefix="/items", tags=["items"])

coreiot_jwt_token = {
    'access_token': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJraGFuaC5tYWkxNjA4MDNAaGNtdXQuZWR1LnZuIiwidXNlcklkIjoiMzU1MmQ2MDAtZTg5Zi0xMWVmLTg3YjUtMjFiY2NmN2QyOWQ1Iiwic2NvcGVzIjpbIlRFTkFOVF9BRE1JTiJdLCJzZXNzaW9uSWQiOiJmNzcxZTVlOS01MGI4LTRhNzYtOGJiNC0zZjNjODQxYjg1YTEiLCJleHAiOjE3NDgzNDg3MjgsImlzcyI6ImNvcmVpb3QuaW8iLCJpYXQiOjE3NDgzMzk3MjgsImZpcnN0TmFtZSI6IktIw4FOSCIsImxhc3ROYW1lIjoiTUFJIFTDlE4gxJDEgk5HIiwiZW5hYmxlZCI6dHJ1ZSwiaXNQdWJsaWMiOmZhbHNlLCJ0ZW5hbnRJZCI6IjM1NDVkZGIwLWU4OWYtMTFlZi04N2I1LTIxYmNjZjdkMjlkNSIsImN1c3RvbWVySWQiOiIxMzgxNDAwMC0xZGQyLTExYjItODA4MC04MDgwODA4MDgwODAifQ.mlSzMjJIj9kMAWF6j6hAVb6UHxV69ML12x9flW525whgUv0CiAe1bbyYIVfjucSyVzCMXJ9A7_LF6LHhPiDg8w',
    'refresh_token': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJraGFuaC5tYWkxNjA4MDNAaGNtdXQuZWR1LnZuIiwidXNlcklkIjoiMzU1MmQ2MDAtZTg5Zi0xMWVmLTg3YjUtMjFiY2NmN2QyOWQ1Iiwic2NvcGVzIjpbIlJFRlJFU0hfVE9LRU4iXSwic2Vzc2lvbklkIjoiZjc3MWU1ZTktNTBiOC00YTc2LThiYjQtM2YzYzg0MWI4NWExIiwiZXhwIjoxNzQ4OTQ0NTI4LCJpc3MiOiJjb3JlaW90LmlvIiwiaWF0IjoxNzQ4MzM5NzI4LCJpc1B1YmxpYyI6ZmFsc2UsImp0aSI6IjQ4M2MwMDhhLTdmMDktNDZiMS04MDM3LWJiMjRjNmNhODhiZSJ9.RWu0M5EAwM4wOSho9AFUy67PacRqO9Tn3YKt9MXGeudmeZDtFJPl-FRbpm6mKI4EVPQQ3M5KQ-YBFksj5Nxnuw'
}

headers = {
    'Authorization': f'Bearer {coreiot_jwt_token["access_token"]}',
    'Content-Type': 'application/json'
}

@router.get("/test-coreiot", response_model=dict)
def test_coreiot_connection():
    """
    Test endpoint to check if we can fetch data from CoreIoT server
    """
    try:
        entityType = 'DEVICE'
        entityId = '7af4ea90-e89f-11ef-87b5-21bccf7d29d5'
        api = f'/api/plugins/telemetry/{entityType}/{entityId}/values/timeseries?keys=temperature,humidity&useStrictDataTypes=true'
        response = requests.get(f'https://api.coreiot.vn/v1{api}', headers=headers)
        
        if response.status_code == 200:
            return {
                "status": "success",
                "data": response.json(),
                "message": "Successfully fetched data from CoreIoT"
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to fetch data from CoreIoT: {response.text}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error connecting to CoreIoT: {str(e)}"
        )

