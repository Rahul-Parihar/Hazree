import re
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.security import decode_access_token, get_token_from_request

# Whitelisted Public Endpoints (Accessible without authentication)
PUBLIC_EXACT_PATHS = {
    "/",
    "/health",
    "/super-admin/login",
    "/super-admin/refresh",
    "/openapi.json",
    "/docs",
    "/redoc",
}

# Regex pattern for public subpaths (like swagger static files or documentation)
PUBLIC_PATH_PATTERNS = [
    re.compile(r"^/docs(/.*)?$"),
    re.compile(r"^/redoc(/.*)?$"),
    re.compile(r"^/static(/.*)?$"),
]


class AuthProtectionMiddleware(BaseHTTPMiddleware):
    """
    Global Route Protection Middleware:
    - Protects all private routes after login (e.g. /companies/*, /super-admin/me, /super-admin/db-status, etc.).
    - Extracts 15-minute access token from HTTP-Only cookie or Authorization Bearer header.
    - Blocks unauthorized requests with standard 401 JSON before reaching route handlers.
    - Injects validated user claims into request.state.user.
    """

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # 1. Allow OPTIONS requests for CORS pre-flight
        if request.method == "OPTIONS":
            return await call_next(request)

        # 2. Check if route is public
        if path in PUBLIC_EXACT_PATHS or any(pattern.match(path) for pattern in PUBLIC_PATH_PATTERNS):
            return await call_next(request)

        # 3. Check for Access Token in HTTP-Only Cookie or Authorization Header
        token = get_token_from_request(request, cookie_name="access_token")
        if not token:
            return JSONResponse(
                status_code=401,
                content={
                    "status": "unauthorized",
                    "message": "Authentication required. Please log in to access this resource.",
                    "detail": "Access token missing from cookies and authorization header."
                },
                headers={"WWW-Authenticate": "Bearer"}
            )

        # 4. Verify Token signature, issuer, audience, and 15-minute expiry
        payload = decode_access_token(token)
        if not payload:
            return JSONResponse(
                status_code=401,
                content={
                    "status": "unauthorized",
                    "message": "Session expired or invalid token.",
                    "detail": "Access token has expired (15-min limit) or is invalid. Please refresh token or log in again."
                },
                headers={"WWW-Authenticate": "Bearer"}
            )

        # 5. Attach decoded user payload to request.state for downstream handlers
        request.state.user = payload

        # 6. Proceed to route execution
        return await call_next(request)
