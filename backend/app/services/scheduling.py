from datetime import datetime, timedelta, timezone

from app.schemas.flashcard import ReviewRating


def utc_start_of_day(d: datetime) -> datetime:
    dt = d.astimezone(timezone.utc)
    return datetime(dt.year, dt.month, dt.day, tzinfo=timezone.utc)


def utc_end_of_day(d: datetime) -> datetime:
    return utc_start_of_day(d) + timedelta(days=1) - timedelta(microseconds=1)


def compute_next_review_at(now: datetime, rating: ReviewRating) -> datetime:
    """Simple MVP scheduling (not full SRS)."""
    if rating == ReviewRating.forgot:
        return now + timedelta(hours=2)
    if rating == ReviewRating.hard:
        return utc_start_of_day(now + timedelta(days=1))
    if rating == ReviewRating.good:
        return utc_start_of_day(now + timedelta(days=3))
    return utc_start_of_day(now + timedelta(days=7))
