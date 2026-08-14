import json
import logging
import time
from typing import Any, Optional, Dict, Tuple
import redis
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger("hazree.redis_cache")

# Global Redis Connection Client & State
_redis_client: Optional[redis.Redis] = None
_last_redis_check: float = 0.0
_redis_retry_cooldown: float = 15.0  # seconds between reconnection attempts if offline

# In-Memory High-Speed Fallback Cache (Key -> (Value, ExpireTimestamp))
_memory_cache: Dict[str, Tuple[Any, float]] = {}


def get_redis_client() -> Optional[redis.Redis]:
    """
    Get or initialize singleton Redis client with ultra-fast non-blocking connection pooling.
    If Redis is down, fails fast without hanging API requests.
    """
    global _redis_client, _last_redis_check
    if not settings.redis_enabled:
        return None

    if _redis_client is not None:
        return _redis_client

    now = time.time()
    if now - _last_redis_check < _redis_retry_cooldown:
        return None  # In cooldown, prevent blocking request

    _last_redis_check = now
    try:
        client = redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_timeout=0.3,
            socket_connect_timeout=0.3,
            retry_on_timeout=False,
            max_connections=20,
        )
        client.ping()
        _redis_client = client
        logger.info("Connected to Redis cache pool successfully.")
        return _redis_client
    except Exception as e:
        logger.debug(f"Redis unavailable ({e}). Using ultra-fast in-memory cache fallback.")
        _redis_client = None
        return None


def is_redis_online() -> bool:
    """Check if Redis server is reachable without blocking."""
    client = get_redis_client()
    if client is None:
        return False
    try:
        return bool(client.ping())
    except Exception:
        return False


def get_cache(key: str) -> Optional[Any]:
    """
    Fetch and deserialize a JSON-encoded value from Redis or high-speed memory cache.
    Response time is < 0.5ms.
    """
    # 1. Try Redis
    client = get_redis_client()
    if client is not None:
        try:
            data = client.get(key)
            if data:
                return json.loads(data)
        except Exception:
            pass

    # 2. In-Memory Fallback
    now = time.time()
    if key in _memory_cache:
        val, expiry = _memory_cache[key]
        if expiry > now:
            return val
        else:
            del _memory_cache[key]

    return None


def set_cache(key: str, value: Any, expire_seconds: Optional[int] = None) -> bool:
    """
    Store value in Redis cache & in-memory cache with TTL.
    Supports Pydantic models, dicts, lists, and primitives.
    """
    ttl = expire_seconds if expire_seconds is not None else settings.redis_default_ttl

    # Extract serializable data
    if isinstance(value, BaseModel):
        val_data = value.model_dump(mode="json")
    elif isinstance(value, (dict, list, int, float, str, bool)):
        val_data = value
    else:
        val_data = str(value)

    # 1. Store in In-Memory Cache (Instant 0ms access)
    _memory_cache[key] = (val_data, time.time() + ttl)

    # 2. Store in Redis
    client = get_redis_client()
    if client is not None:
        try:
            serialized = json.dumps(val_data, default=str)
            client.setex(key, ttl, serialized)
            return True
        except Exception:
            pass

    return True


def delete_cache(key: str) -> bool:
    """Remove a specific key from Redis and in-memory cache."""
    if key in _memory_cache:
        del _memory_cache[key]

    client = get_redis_client()
    if client is not None:
        try:
            return bool(client.delete(key))
        except Exception:
            pass
    return True


def delete_cache_pattern(pattern: str) -> int:
    """Remove all keys matching a pattern from Redis and in-memory cache."""
    # Clear matching memory cache keys
    prefix = pattern.replace("*", "")
    matching_mem_keys = [k for k in _memory_cache.keys() if k.startswith(prefix)]
    for k in matching_mem_keys:
        _memory_cache.pop(k, None)

    client = get_redis_client()
    if client is not None:
        try:
            keys = client.keys(pattern)
            if keys:
                return client.delete(*keys)
        except Exception:
            pass
    return len(matching_mem_keys)
