import json
import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.manager import ws_manager

logger = logging.getLogger("hazree.websocket.router")

router = APIRouter(
    tags=["Global WebSockets"],
)


@router.websocket("/ws/attendance")
@router.websocket("/ws")
async def websocket_attendance_endpoint(
    websocket: WebSocket,
    company_id: Optional[int] = None,
    employee_id: Optional[int] = None,
):
    """
    Global WebSocket endpoint for real-time bidirectional events across portals.
    """
    metadata = {
        "company_id": company_id,
        "employee_id": employee_id,
    }
    await ws_manager.connect(websocket, metadata=metadata)
    try:
        # Acknowledge connection
        await websocket.send_json({
            "event": "CONNECTED",
            "message": "Connected to Hazree Real-Time Stream",
            "active_connections": len(ws_manager.active_connections),
        })

        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "PING":
                    await websocket.send_json({
                        "type": "PONG",
                        "timestamp": datetime.now().isoformat(),
                    })
            except Exception:
                pass

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket session closed: {e}")
        ws_manager.disconnect(websocket)
