import asyncio
import json
import logging
from typing import Dict, List, Optional
from fastapi import WebSocket

logger = logging.getLogger("hazree.websocket")


class WebSocketConnectionManager:
    """
    Global WebSocket Connection Manager for Hazree Platform.
    Tracks all active connections across Super Admin, Company Admin, and Customer Portals.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.socket_metadata: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, metadata: Optional[dict] = None):
        """Accept incoming connection and register metadata."""
        await websocket.accept()
        self.active_connections.append(websocket)
        if metadata:
            self.socket_metadata[websocket] = metadata
        logger.info(f"WebSocket client connected. Active sessions: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Clean up connection on disconnect."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.socket_metadata:
            del self.socket_metadata[websocket]
        logger.info(f"WebSocket client disconnected. Remaining sessions: {len(self.active_connections)}")

    async def broadcast(self, message: dict, company_id: Optional[int] = None):
        """Broadcast payload to all active clients with error resilience."""
        if not self.active_connections:
            return

        for connection in list(self.active_connections):
            try:
                meta = self.socket_metadata.get(connection)
                if meta and company_id and meta.get("company_id") is not None:
                    if meta.get("company_id") != company_id:
                        continue

                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error sending WS payload: {e}")
                self.disconnect(connection)

    def broadcast_sync(self, message: dict, company_id: Optional[int] = None):
        """Synchronous bridge to fire async broadcast safely from database services."""
        try:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                loop.create_task(self.broadcast(message, company_id=company_id))
            else:
                asyncio.run(self.broadcast(message, company_id=company_id))
        except Exception as e:
            logger.warning(f"Error dispatching WS broadcast: {e}")


ws_manager = WebSocketConnectionManager()
