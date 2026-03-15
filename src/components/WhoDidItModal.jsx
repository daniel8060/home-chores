import { useEffect } from 'react';

export default function WhoDidItModal({ choreName, onSelect, onCancel }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal__title">Who did it?</h3>
        <p className="modal__chore">{choreName}</p>
        <div className="modal__buttons">
          <button
            className="btn btn--daniel"
            onClick={() => onSelect('daniel')}
          >
            Daniel
          </button>
          <button
            className="btn btn--crimson"
            onClick={() => onSelect('crimson')}
          >
            Crimson
          </button>
        </div>
        <button className="modal__cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
