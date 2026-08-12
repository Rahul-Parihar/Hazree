import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("hazree.api")
logging.basicConfig(level=logging.INFO)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Performance & Timing Middleware:
    - Calculates the processing time for each API request in milliseconds.
    - Logs structured output: [METHOD] /path - STATUS (TIME ms).
    - Injects 'X-Process-Time' header in all HTTP responses.
    """

    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()

        response = await call_next(request)

        process_time_ms = (time.perf_counter() - start_time) * 1000
        formatted_time = f"{process_time_ms:.2f}ms"

        # Attach execution time header to response
        response.headers["X-Process-Time"] = formatted_time

        # Clean color-formatted console log
        status_code = response.status_code
        status_color = "\033[92m" if status_code < 400 else ("\033[93m" if status_code < 500 else "\033[91m")
        reset_color = "\033[0m"
        method_color = "\033[96m"

        print(
            f"{method_color}[{request.method}]{reset_color} {request.url.path} ➔ "
            f"{status_color}{status_code}{reset_color} ({formatted_time})"
        )

        return response
