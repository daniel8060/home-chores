import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), "chores.db")

# Hardcoded seed data — mirrors src/data/chores.js
INITIAL_CHORES = [
    # Daily
    {"id": "litter-box",           "name": "Litter box",                      "owner": "daniel",  "frequency": "daily",    "notes": "Crimson covers on her days off"},
    {"id": "dishes-dishwasher",    "name": "Dishes / dishwasher",             "owner": "both",    "frequency": "daily",    "notes": "Whoever didn't cook"},
    {"id": "wipe-kitchen-counters","name": "Wipe kitchen counters",           "owner": "both",    "frequency": "daily",    "notes": "Spot clean as needed"},
    # Weekly
    {"id": "roomba-prep-run",      "name": "Roomba prep + run",               "owner": "flexible","frequency": "weekly",   "notes": "Whoever has time; clear floors, run, empty bin"},
    {"id": "sweep-dry-mop",        "name": "Sweep / dry mop",                 "owner": "daniel",  "frequency": "weekly",   "notes": "Edges and corners Roomba can't reach"},
    {"id": "wet-mop-floors",       "name": "Wet mop floors",                  "owner": "daniel",  "frequency": "weekly",   "notes": "After sweeping"},
    {"id": "wipe-flat-surfaces",   "name": "Wipe flat surfaces",              "owner": "crimson", "frequency": "weekly",   "notes": "Coffee table, dining table, TV stand"},
    {"id": "trash-recycling",      "name": "Trash + recycling",               "owner": "daniel",  "frequency": "weekly",   "notes": "On pickup day"},
    {"id": "laundry",              "name": "Laundry",                         "owner": "both",    "frequency": "weekly",   "notes": ""},
    {"id": "wipe-stovetop-microwave","name": "Wipe stovetop + microwave",     "owner": "crimson", "frequency": "weekly",   "notes": ""},
    {"id": "grocery-run",          "name": "Grocery run",                     "owner": "both",    "frequency": "weekly",   "notes": ""},
    {"id": "wipe-cat-food-area",   "name": "Wipe cat food area",              "owner": "crimson", "frequency": "weekly",   "notes": ""},
    # Bi-weekly
    {"id": "clean-bathroom",       "name": "Clean bathroom",                  "owner": "both",    "frequency": "biweekly", "notes": ""},
    {"id": "change-bed-sheets",    "name": "Change bed sheets",               "owner": "both",    "frequency": "biweekly", "notes": ""},
    {"id": "patio-tidy-up",        "name": "Patio tidy-up",                   "owner": "daniel",  "frequency": "biweekly", "notes": ""},
    # Monthly
    {"id": "deep-clean-cat-fountain",     "name": "Deep clean cat water fountain",  "owner": "crimson", "frequency": "monthly",  "notes": "Permanent Crimson task"},
    {"id": "clean-roomba-bin-brushes",    "name": "Clean Roomba bin + brushes",     "owner": "daniel",  "frequency": "monthly",  "notes": "Full maintenance, not just emptying"},
    {"id": "wipe-baseboards",             "name": "Wipe baseboards",                "owner": "daniel",  "frequency": "monthly",  "notes": ""},
    {"id": "clean-inside-fridge",         "name": "Clean inside fridge",            "owner": "both",    "frequency": "monthly",  "notes": ""},
    {"id": "clean-oven-dishwasher-interior","name": "Clean oven + dishwasher interior","owner": "daniel","frequency": "monthly",  "notes": ""},
    {"id": "wipe-light-switches-door-handles","name": "Wipe light switches + door handles","owner": "crimson","frequency": "monthly","notes": ""},
]


def init_db():
    """Create tables and seed chores if the DB is new."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS chores (
                id         TEXT PRIMARY KEY,
                name       TEXT NOT NULL,
                owner      TEXT NOT NULL,
                frequency  TEXT NOT NULL,
                notes      TEXT NOT NULL DEFAULT '',
                is_active  INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS completions (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                chore_id     TEXT REFERENCES chores(id),
                chore_name   TEXT NOT NULL,
                completed_by TEXT NOT NULL,
                completed_at TEXT NOT NULL,
                notes        TEXT NOT NULL DEFAULT '',
                created_at   TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_comp_chore_id     ON completions(chore_id);
            CREATE INDEX IF NOT EXISTS idx_comp_completed_at ON completions(completed_at DESC);
        """)
        count = conn.execute("SELECT COUNT(*) FROM chores").fetchone()[0]
        if count == 0:
            conn.executemany(
                "INSERT INTO chores (id, name, owner, frequency, notes) VALUES (?, ?, ?, ?, ?)",
                [(c["id"], c["name"], c["owner"], c["frequency"], c["notes"])
                 for c in INITIAL_CHORES],
            )


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
