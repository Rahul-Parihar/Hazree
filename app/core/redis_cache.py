import json
import logging
from typing import Any, Optional
import redis
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger("hazree.redis_cache")

# Global Redis Connection Client
_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> Optional[redis.Redis]:
    """
    Get or initialize singleton Redis client with connection pooling.
    Returns None if Redis is disabled or unreachable.
    """
    global _redis_client
    if not settings.redis_enabled:
        return None

    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.redis_url,
                decode_responses=True,
                socket_timeout=2.0,
                socket_connect_timeout=2.0,
                retry_on_timeout=True,
            )
            # Ping test
            _redis_client.ping()
            logger.info("Connected to Redis cache pool successfully.")
        except Exception as e:
            logger.warning(f"Redis connection failed ({e}). Operating in database fallback mode.")
            _redis_client = None

    return _redis_client


def is_redis_online() -> bool:
    """Check if Redis server is reachable."""
    client = get_redis_client()
    if client is None:
        return False
    try:
        return bool(client.ping())
    except Exception:
        return False


def get_cache(key: str) -> Optional[Any]:
    """
    Fetch and deserialize a JSON-encoded value from Redis cache.
    Returns None on cache miss or connection failure.
    """
    client = get_redis_client()
    if client is None:
        return None

    try:
        data = client.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        logger.debug(f"Redis cache fetch error for key '{key}': {e}")
    return None


def set_cache(key: str, value: Any, expire_seconds: Optional[int] = None) -> bool:
    """
    Serialize and store a value in Redis cache with TTL expiration.
    Supports Pydantic models, dicts, lists, and primitives.
    """
    client = get_redis_client()
    if client is None:
        return False

    ttl = expire_seconds if expire_seconds is not None else settings.redis_default_ttl
    try:
        if isinstance(value, BaseModel):
            serialized = value.model_dump_json()
        elif isinstance(value, (dict, list, int, float, str, bool)):
            serialized = json.dumps(value, default=str)
        else:
            serialized = json.dumps(value, default=str)

        client.setex(key, ttl, serialized)
        return True
    except Exception as e:
        logger.debug(f"Redis cache store error for key '{key}': {e}")
        return False


def delete_cache(key: str) -> bool:
    """Remove a specific key from Redis cache."""
    client = get_redis_client()
    if client is None:
        return False
    try:
        return bool(client.delete(key))
    except Exception as e:
        logger.debug(f"Redis cache delete error for key '{key}': {e}")
        return False


def delete_cache_pattern(pattern: str) -> int:
    """Remove all keys matching a glob pattern (e.g. 'overview:*')."""
    client = get_redis_client()
    if client is None:
        return 0
    try:
        keys = client.keys(pattern)
        if keys:
            return client.delete(*keys)
    except Exception as e:
        logger.debug(f"Redis cache pattern delete error for '{pattern}': {e}")
    return 0
