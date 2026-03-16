import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import get_db, init_db
from models import ChoreCreate, ChoreUpdate, CompletionCreate, CompletionUpdate

app = FastAPI(title="Chore Tracker API")

# Allow all origins — this runs on a private LAN only
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


# ── Chores ────────────────────────────────────────────────────────────────────

@app.get("/api/chores")
def list_chores():
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM chores WHERE is_active = 1 ORDER BY rowid"
        ).fetchall()
        return [dict(r) for r in rows]


@app.post("/api/chores", status_code=201)
def create_chore(body: ChoreCreate):
    chore_id = body.id or str(uuid.uuid4())
    with get_db() as db:
        db.execute(
            "INSERT INTO chores (id, name, owner, frequency, notes) VALUES (?, ?, ?, ?, ?)",
            (chore_id, body.name, body.owner, body.frequency, body.notes),
        )
    return {"id": chore_id}


@app.put("/api/chores/{chore_id}")
def update_chore(chore_id: str, body: ChoreUpdate):
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(400, "No fields to update")
    set_clause = ", ".join(f"{k} = ?" for k in fields)
    with get_db() as db:
        db.execute(
            f"UPDATE chores SET {set_clause} WHERE id = ?",
            (*fields.values(), chore_id),
        )
    return {"ok": True}


@app.delete("/api/chores/{chore_id}")
def delete_chore(chore_id: str):
    with get_db() as db:
        db.execute("UPDATE chores SET is_active = 0 WHERE id = ?", (chore_id,))
    return {"ok": True}


# ── Completions ───────────────────────────────────────────────────────────────

@app.get("/api/completions")
def list_completions(search: str = "", limit: int = 1000, offset: int = 0):
    with get_db() as db:
        if search:
            rows = db.execute(
                """SELECT * FROM completions
                   WHERE chore_name LIKE ? OR notes LIKE ?
                   ORDER BY completed_at DESC
                   LIMIT ? OFFSET ?""",
                (f"%{search}%", f"%{search}%", limit, offset),
            ).fetchall()
        else:
            rows = db.execute(
                """SELECT * FROM completions
                   ORDER BY completed_at DESC
                   LIMIT ? OFFSET ?""",
                (limit, offset),
            ).fetchall()
        return [dict(r) for r in rows]


@app.post("/api/completions", status_code=201)
def create_completion(body: CompletionCreate):
    with get_db() as db:
        cur = db.execute(
            """INSERT INTO completions
               (chore_id, chore_name, completed_by, completed_at, notes)
               VALUES (?, ?, ?, ?, ?)""",
            (body.chore_id, body.chore_name, body.completed_by,
             body.completed_at, body.notes),
        )
        return {"id": cur.lastrowid}


@app.put("/api/completions/{completion_id}")
def update_completion(completion_id: int, body: CompletionUpdate):
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(400, "No fields to update")
    set_clause = ", ".join(f"{k} = ?" for k in fields)
    with get_db() as db:
        db.execute(
            f"UPDATE completions SET {set_clause} WHERE id = ?",
            (*fields.values(), completion_id),
        )
    return {"ok": True}


@app.delete("/api/completions")
def clear_all_completions():
    """Wipe the entire completion history (used by the UI's 'Clear history' button)."""
    with get_db() as db:
        db.execute("DELETE FROM completions")
    return {"ok": True}


@app.delete("/api/completions/{completion_id}")
def delete_completion(completion_id: int):
    with get_db() as db:
        db.execute("DELETE FROM completions WHERE id = ?", (completion_id,))
    return {"ok": True}
