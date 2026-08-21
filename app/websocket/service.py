import logging
from typing import Optional
from app.websocket.manager import ws_manager

logger = logging.getLogger("hazree.websocket.service")


def broadcast_punch_event(
    action: str,
    record_data: dict,
    employee_id: Optional[int] = None,
    employee_name: Optional[str] = None,
    company_id: Optional[int] = None,
):
    """
    Broadcasts real-time Clock In / Clock Out attendance punch event globally.
    """
    try:
        ws_manager.broadcast_sync({
            "event": "ATTENDANCE_PUNCH",
            "action": action,  # 'CLOCK_IN' or 'CLOCK_OUT'
            "employee_id": employee_id,
            "employee_name": employee_name,
            "company_id": company_id,
            "data": record_data,
        }, company_id=company_id)
    except Exception as e:
        logger.warning(f"Failed to broadcast punch event: {e}")


def broadcast_update_event(
    record_data: dict,
    employee_id: Optional[int] = None,
    employee_name: Optional[str] = None,
    company_id: Optional[int] = None,
):
    """
    Broadcasts attendance update event globally.
    """
    try:
        ws_manager.broadcast_sync({
            "event": "ATTENDANCE_UPDATE",
            "action": "UPDATE",
            "employee_id": employee_id,
            "employee_name": employee_name,
            "company_id": company_id,
            "data": record_data,
        }, company_id=company_id)
    except Exception as e:
        logger.warning(f"Failed to broadcast update event: {e}")


def broadcast_delete_event(
    record_id: int,
    employee_id: Optional[int] = None,
    company_id: Optional[int] = None,
):
    """
    Broadcasts attendance deletion event globally.
    """
    try:
        ws_manager.broadcast_sync({
            "event": "ATTENDANCE_DELETE",
            "action": "DELETE",
            "record_id": record_id,
            "employee_id": employee_id,
            "company_id": company_id,
        }, company_id=company_id)
    except Exception as e:
        logger.warning(f"Failed to broadcast delete event: {e}")
