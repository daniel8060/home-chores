import { useState, useEffect } from 'react';
import { apiPut } from '../api/client';

function toDateInput(dateStr) {
  // dateStr is already YYYY-MM-DD
  return dateStr || new Date().toLocaleDateString('en-CA');
}

/**
 * Edit an existing completion entry (who did it, date, notes).
 * The chore name is shown for context but is not editable.
 */
export default function CompletionEditModal({ completion, onSave, onCancel }) {
  const [completedBy, setCompletedBy] = useState(completion.completedBy);
  const [completedAt, setCompletedAt] = useState(toDateInput(completion.completedAt));
  const [notes,       setNotes]       = useState(completion.notes ?? '');
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await apiPut(`/completions/${completion.id}`, {
        completed_by: completedBy,
        completed_at: completedAt,
        notes:        notes.trim(),
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal__title">Edit log entry</h3>
        <p className="modal__chore">{completion.choreName}</p>

        {/* Person */}
        <div className="modal__person-picker">
          <span className="modal__field-label">Who did it?</span>
          <div className="modal__buttons">
            <button
              className={`btn btn--daniel ${completedBy === 'daniel' ? 'btn--selected' : ''}`}
              onClick={() => setCompletedBy('daniel')}
            >
              Daniel
            </button>
            <button
              className={`btn btn--crimson ${completedBy === 'crimson' ? 'btn--selected' : ''}`}
              onClick={() => setCompletedBy('crimson')}
            >
              Crimson
            </button>
          </div>
        </div>

        {/* Date */}
        <label className="modal__field">
          <span className="modal__field-label">Date</span>
          <input
            type="date"
            className="modal__datetime"
            value={completedAt}
            max={new Date().toLocaleDateString('en-CA')}
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
            placeholder="Any notes…"
            rows={2}
          />
        </label>

        <div className="modal__actions">
          <button className="modal__cancel" onClick={onCancel}>Cancel</button>
          <button className="btn btn--done" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
