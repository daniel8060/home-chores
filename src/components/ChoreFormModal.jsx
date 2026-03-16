import { useState, useEffect } from 'react';
import { apiPost, apiPut } from '../api/client';

const OWNERS = [
  { value: 'daniel',  label: 'Daniel'   },
  { value: 'crimson', label: 'Crimson'  },
  { value: 'both',    label: 'Both'     },
  { value: 'flexible',label: 'Flexible' },
];

const FREQUENCIES = [
  { value: 'daily',    label: 'Daily'     },
  { value: 'weekly',   label: 'Weekly'    },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly',  label: 'Monthly'   },
];

/**
 * Add / edit a chore definition.
 * Pass `chore` for edit mode, omit (or null) for add mode.
 */
export default function ChoreFormModal({ chore, onSave, onCancel }) {
  const isNew = !chore;

  const [name,      setName]      = useState(chore?.name      ?? '');
  const [owner,     setOwner]     = useState(chore?.owner     ?? 'both');
  const [frequency, setFrequency] = useState(chore?.frequency ?? 'weekly');
  const [notes,     setNotes]     = useState(chore?.notes     ?? '');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const body = { name: name.trim(), owner, frequency, notes: notes.trim() };
      if (isNew) {
        await apiPost('/chores', body);
      } else {
        await apiPut(`/chores/${chore.id}`, body);
      }
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal__title">{isNew ? 'Add chore' : 'Edit chore'}</h3>

        {/* Name */}
        <label className="modal__field">
          <span className="modal__field-label">Name</span>
          <input
            type="text"
            className="modal__datetime"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Take out recycling"
            autoFocus
          />
        </label>

        {/* Owner */}
        <div className="modal__field">
          <span className="modal__field-label">Owner</span>
          <div className="modal__choice-group">
            {OWNERS.map(({ value, label }) => (
              <button
                key={value}
                className={`choice-btn choice-btn--${value} ${owner === value ? 'choice-btn--selected' : ''}`}
                onClick={() => setOwner(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div className="modal__field">
          <span className="modal__field-label">Frequency</span>
          <div className="modal__choice-group">
            {FREQUENCIES.map(({ value, label }) => (
              <button
                key={value}
                className={`choice-btn ${frequency === value ? 'choice-btn--selected choice-btn--freq' : ''}`}
                onClick={() => setFrequency(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <label className="modal__field">
          <span className="modal__field-label">Notes <span className="modal__optional">(optional)</span></span>
          <textarea
            className="modal__notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any hints or context…"
            rows={2}
          />
        </label>

        <div className="modal__actions">
          <button className="modal__cancel" onClick={onCancel}>Cancel</button>
          <button
            className="btn btn--done"
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
          >
            {saving ? 'Saving…' : isNew ? 'Add chore' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
