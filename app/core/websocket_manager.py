import asyncio
import json
import logging
from typing import Dict, List, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("hazree.websocket")


class WebSocketConnectionManager:
    def __init__(self):
        # List of active connections
        self.active_connections: List[WebSocket] = []
        # Optional metadata per socket if needed
        self.socket_metadata: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, metadata: Optional[dict] = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if metadata:
            self.socket_metadata[websocket] = metadata
        logger.info(f"WebSocket connected. Total active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.socket_metadata:
            del self.socket_metadata[websocket]
        logger.info(f"WebSocket disconnected. Remaining connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.warning(f"Error sending message to individual websocket: {e}")

    async def broadcast(self, message: dict, company_id: Optional[int] = None):
        """
        Broadcast JSON message to all connected clients.
        If company_id is provided, clients tagged with a different company_id are optionally filtered,
        or sent to all if not strictly partitioned.
        """
        if not self.active_connections:
            return

        disconnected_sockets = []
        for connection in list(self.active_connections):
            try:
                # If connection has metadata with company_id, check match
                meta = self.socket_metadata.get(connection)
                if meta and company_id and meta.get("company_id") is not None:
                    if meta.get("company_id") != company_id:
                        continue

                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error broadcasting to connection: {e}")
                disconnected_sockets.append(connection)

        for dead_conn in disconnected_sockets:
            self.disconnect(dead_conn)

    def broadcast_sync(self, message: dict, company_id: Optional[int] = None):
        """Helper to fire async broadcast safely from any context."""
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
