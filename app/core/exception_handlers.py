import logging
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings

logger = logging.getLogger("hazree.exception_handlers")


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """
    Handles HTTP 429 Too Many Requests when rate limit threshold is crossed.
    """
    client_ip = request.client.host if request.client else "unknown"
    logger.warning(
        f"Rate limit exceeded on '{request.method} {request.url.path}' from IP: {client_ip}"
    )
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "status": "rate_limited",
            "message": "Too many requests. Please wait a moment before trying again.",
            "detail": f"Rate limit reached on this endpoint ({exc.detail}).",
        },
        headers={"Retry-After": "60"},
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Formats Pydantic 422 Request Validation errors into clean, readable field errors.
    """
    formatted_errors = []
    for err in exc.errors():
        field_path = " -> ".join(str(loc) for loc in err.get("loc", []))
        message = err.get("msg", "Invalid value")
        formatted_errors.append(f"{field_path}: {message}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "validation_error",
            "message": "Input validation failed. Please check your submission.",
            "detail": formatted_errors,
        },
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Standardizes FastAPI / Starlette HTTPException responses into a consistent JSON envelope.
    """
    status_label = "error"
    if exc.status_code == status.HTTP_401_UNAUTHORIZED:
        status_label = "unauthorized"
    elif exc.status_code == status.HTTP_403_FORBIDDEN:
        status_label = "forbidden"
    elif exc.status_code == status.HTTP_404_NOT_FOUND:
        status_label = "not_found"

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": status_label,
            "message": str(exc.detail),
            "detail": str(exc.detail),
        },
        headers=exc.headers,
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global 500 Error Shield:
    - Catches all unhandled application crashes.
    - Logs full stack trace securely to the server logs.
    - Masks internal traces from the client in production to prevent information disclosure.
    """
    logger.error(
        f"Unhandled server error on '{request.method} {request.url.path}': {str(exc)}",
        exc_info=True,
    )

    error_detail = (
        f"Server error: {str(exc)}"
        if settings.debug
        else "An unexpected internal error occurred on the server. Please try again later."
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "internal_error",
            "message": "An unexpected server error occurred.",
            "detail": error_detail,
        },
    )
