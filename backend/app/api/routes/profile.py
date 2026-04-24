from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.deps import get_user_id
from app.db import memory_store
from app.schemas.profile import ProfileSummaryOut, RecentActivityItem

router = APIRouter()


@router.get("/summary", response_model=ProfileSummaryOut)
def profile_summary(user_id: UUID = Depends(get_user_id)) -> ProfileSummaryOut:
    lessons = memory_store.store.list_lessons_for_user(user_id)
    cards = memory_store.store.list_flashcards_for_user(user_id)
    streak = memory_store.store.current_streak(user_id)

    activity_rows = memory_store.store.recent_activity(user_id, limit=8)
    recent = [RecentActivityItem(kind=k, label=label, at=at) for k, label, at in activity_rows]

    return ProfileSummaryOut(
        user_id=user_id,
        total_lessons=len(lessons),
        total_flashcards=len(cards),
        streak=streak,
        recent_activity=recent,
    )
