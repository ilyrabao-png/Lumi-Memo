from uuid import UUID

from fastapi import Header

# Until Supabase JWT verification is wired, scope in-memory data with this header.
_DEFAULT_DEV_USER_ID = UUID("00000000-0000-4000-8000-000000000001")


def get_user_id(x_user_id: str | None = Header(default=None, alias="X-User-Id")) -> UUID:
    if not x_user_id:
        return _DEFAULT_DEV_USER_ID
    return UUID(x_user_id)
