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
    completed_at: str                 # YYYY-MM-DD (user-supplied, enables backfill)
    notes: str = ""


class CompletionUpdate(BaseModel):
    completed_by: Optional[str] = None  # 'daniel' | 'crimson'
    completed_at: Optional[str] = None  # YYYY-MM-DD
    notes: Optional[str] = None
