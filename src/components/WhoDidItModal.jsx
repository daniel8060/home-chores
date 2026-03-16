import { useState, useEffect } from 'react';

/** Format a Date as the value required by <input type="date"> → YYYY-MM-DD */
function toDateInput(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Log-completion modal.
 *
 * Props:
 *   chore        — full chore object { id, name, owner, ... }
 *   crimsonDayOff — bool, forces crimson for litter-box
 *   onConfirm(person, notes, completedAt) — called on submit
 *   onCancel()   — called on cancel / Escape
 */
export default function WhoDidItModal({ chore, crimsonDayOff, onConfirm, onCancel }) {
  // Pre-select the expected owner so single-owner chores are still one-tap;
  // both/flexible start with no selection so a deliberate choice is required.
  const defaultPerson =
    chore.owner === 'both' || chore.owner === 'flexible'
      ? null
      : chore.id === 'litter-box' && crimsonDayOff
        ? 'crimson'
        : chore.owner;

  const [person, setPerson]           = useState(defaultPerson);
  const [notes, setNotes]             = useState('');
  const [completedAt, setCompletedAt] = useState(() => toDateInput(new Date()));

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const handleSubmit = () => {
    if (!person) return;
    onConfirm(person, notes.trim(), completedAt); // completedAt is already YYYY-MM-DD
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal__title">Log chore</h3>
        <p className="modal__chore">{chore.name}</p>

        {/* Person picker — always shown for every chore */}
        <div className="modal__person-picker">
          <span className="modal__field-label">Who did it?</span>
          <div className="modal__buttons">
            <button
              className={`btn btn--daniel ${person === 'daniel' ? 'btn--selected' : ''}`}
              onClick={() => setPerson('daniel')}
            >
              Daniel
            </button>
            <button
              className={`btn btn--crimson ${person === 'crimson' ? 'btn--selected' : ''}`}
              onClick={() => setPerson('crimson')}
            >
              Crimson
            </button>
          </div>
        </div>

        {/* When */}
        <label className="modal__field">
          <span className="modal__field-label">When</span>
          <input
            type="date"
            className="modal__datetime"
            value={completedAt}
            max={toDateInput(new Date())}
            onChange={(e) => setCompletedAt(e.target.value)}
          />
        </label>

        {/* Notes */}
        <label className="modal__field">
          <span className="modal__field-label">Notes <span className="modal__optional">(optional)</span></span>
          <textarea
            className="modal__notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this completion…"
            rows={2}
          />
        </label>

        <div className="modal__actions">
          <button className="modal__cancel" onClick={onCancel}>Cancel</button>
          <button
            className="btn btn--done"
            onClick={handleSubmit}
            disabled={!person}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
