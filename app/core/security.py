import os
import uuid
import secrets
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from fastapi import Request, Response
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings

# OAuth2 scheme for JWT Bearer token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/super-admin/login", auto_error=False)


def get_password_hash(password: str) -> str:
    """Generate a secure bcrypt hash of a plain text password."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a bcrypt hashed password."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def _generate_high_entropy_nonce() -> str:
    """Generate 256-bit cryptographic entropy nonce to increase token security, uniqueness and size."""
    return secrets.token_hex(32)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed, high-entropy 15-minute JWT access token.
    Payload contains rich claims, unique JTI, entropy padding, and issuer/audience.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)

    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.access_token_expire_minutes)

    to_encode.update({
        "token_type": "access",
        "jti": str(uuid.uuid4()),
        "nonce_entropy": _generate_high_entropy_nonce(),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    })

    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed 7-day JWT refresh token with high-entropy cryptographic claims.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)

    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.refresh_token_expire_days)

    to_encode.update({
        "token_type": "refresh",
        "jti": str(uuid.uuid4()),
        "nonce_entropy": _generate_high_entropy_nonce(),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    })

    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)


def create_token_pair(data: dict) -> Tuple[str, str]:
    """
    Generate both (access_token, refresh_token) pair.
    - Access token: 15 minutes lifetime
    - Refresh token: 7 days lifetime
    """
    access_token = create_access_token(data)
    refresh_token = create_refresh_token(data)
    return access_token, refresh_token


def decode_token(token: str, expected_type: Optional[str] = None) -> Optional[dict]:
    """
    Decode, verify signature, expiry, audience, issuer, and token type.
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
            audience=settings.jwt_audience,
            issuer=settings.jwt_issuer,
            options={"require": ["exp", "iat", "token_type", "sub"]}
        )

        if expected_type and payload.get("token_type") != expected_type:
            return None

        return payload
    except jwt.PyJWTError:
        return None


def decode_access_token(token: str) -> Optional[dict]:
    """Convenience wrapper to decode access tokens specifically."""
    return decode_token(token, expected_type="access")


def decode_refresh_token(token: str) -> Optional[dict]:
    """Convenience wrapper to decode refresh tokens specifically."""
    return decode_token(token, expected_type="refresh")


def set_auth_cookies(
    response: Response,
    access_token: str,
    refresh_token: Optional[str] = None
) -> None:
    """
    Set HTTP-Only, SameSite, Secure cookies for access_token and refresh_token.
    - access_token: 15 minutes (900 seconds)
    - refresh_token: 7 days (604800 seconds)
    """
    access_max_age = settings.access_token_expire_minutes * 60
    refresh_max_age = settings.refresh_token_expire_days * 86400

    # 1. Set Access Token Cookie (15 Minutes)
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=access_max_age,
        expires=access_max_age,
        path="/",
        domain=settings.cookie_domain,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )

    # 2. Set Refresh Token Cookie (7 Days)
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=refresh_max_age,
            expires=refresh_max_age,
            path="/",
            domain=settings.cookie_domain,
            httponly=True,
            secure=settings.cookie_secure,
            samesite=settings.cookie_samesite,
        )


def clear_auth_cookies(response: Response) -> None:
    """
    Delete all authentication cookies on logout.
    """
    response.delete_cookie(
        key="access_token",
        path="/",
        domain=settings.cookie_domain,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )
    response.delete_cookie(
        key="refresh_token",
        path="/",
        domain=settings.cookie_domain,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )


def get_token_from_request(request: Request, cookie_name: str = "access_token") -> Optional[str]:
    """
    Extract token from HTTP-Only cookie first, then fallback to Authorization header.
    """
    # 1. Try Cookie
    cookie_token = request.cookies.get(cookie_name)
    if cookie_token:
        if cookie_token.startswith("Bearer "):
            return cookie_token[7:]
        return cookie_token

    # 2. Try Authorization Header (if asking for access_token)
    if cookie_name == "access_token":
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header[7:]

    return None
