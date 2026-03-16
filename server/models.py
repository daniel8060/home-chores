from pydantic import BaseModel
from typing import Optional


class ChoreCreate(BaseModel):
    id: Optional[str] = None
    name: str
    owner: str      # 'daniel' | 'crimson' | 'both' | 'flexible' | 'adhoc'
    frequency: str  # 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'adhoc'
    notes: str = ""


class ChoreUpdate(BaseModel):
    name: Optional[str] = None
    owner: Optional[str] = None
    frequency: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[int] = None


class CompletionCreate(BaseModel):
    chore_id: Optional[str] = None   # None for ad-hoc completions
    chore_name: str
    completed_by: str                 # 'daniel' | 'crimson'
    completed_at: str                 # ISO-8601 string (user-supplied, enables backfill)
    notes: str = ""
