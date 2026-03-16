import { useState, useEffect, useRef } from 'react';
import { apiGet, apiDelete, mapCompletion } from '../api/client';
import { FREQUENCY_LABELS, FREQUENCY_ORDER } from '../data/chores';
import { formatDateTime } from '../utils/time';
import ChoreFormModal from './ChoreFormModal';
import CompletionEditModal from './CompletionEditModal';

const PAGE_SIZE = 50;
const PERSON_LABELS = { daniel: 'Daniel', crimson: 'Crimson' };

/**
 * Administrative portal.
 *
 * Props:
 *   chores        — array of chore definitions from App
 *   refreshToken  — increment from parent to trigger re-fetch
 *   onDataChanged — called after any mutation so App can reload its state
 */
export default function ManageTab({ chores, refreshToken, onDataChanged }) {
  // ── Chore form modal state ──────────────────────────────────────────────────
  const [choreModal, setChoreModal] = useState(null); // null | 'new' | chore object

  // ── Completion list + edit state ────────────────────────────────────────────
  const [completions,      setCompletions]      = useState([]);
  const [compSearch,       setCompSearch]       = useState('');
  const [compOffset,       setCompOffset]       = useState(0);
  const [compHasMore,      setCompHasMore]      = useState(false);
  const [compLoading,      setCompLoading]      = useState(false);
  const [editingCompletion, setEditingCompletion] = useState(null);
  const debounceRef = useRef(null);

  // Fetch completions
  const fetchCompletions = (q, off = 0, append = false) => {
    setCompLoading(true);
    const params = new URLSearchParams({ search: q, limit: PAGE_SIZE + 1, offset: off });
    apiGet(`/completions?${params}`)
      .then((rows) => {
        const hasMore = rows.length > PAGE_SIZE;
        const mapped  = rows.slice(0, PAGE_SIZE).map(mapCompletion);
        setCompletions((prev) => append ? [...prev, ...mapped] : mapped);
        setCompHasMore(hasMore);
        setCompOffset(off + PAGE_SIZE);
      })
      .finally(() => setCompLoading(false));
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => fetchCompletions(compSearch, 0, false),
      compSearch ? 250 : 0,
    );
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compSearch, refreshToken]);

  // ── Chore actions ────────────────────────────────────────────────────────────
  const handleChoreDeleted = async (chore) => {
    if (!window.confirm(`Delete "${chore.name}"? Past log entries are kept.`)) return;
    await apiDelete(`/chores/${chore.id}`);
    onDataChanged();
  };

  // ── Completion actions ───────────────────────────────────────────────────────
  const handleCompletionDeleted = async (c) => {
    if (!window.confirm(`Delete this log entry for "${c.choreName}"?`)) return;
    await apiDelete(`/completions/${c.id}`);
    onDataChanged();
    fetchCompletions(compSearch, 0, false);
  };

  // Group chores by frequency for display
  const grouped = {};
  for (const freq of FREQUENCY_ORDER) {
    grouped[freq] = chores.filter((c) => c.frequency === freq);
  }

  return (
    <div className="manage-tab">
      {/* ── Modals ── */}
      {choreModal && (
        <ChoreFormModal
          chore={choreModal === 'new' ? null : choreModal}
          onSave={() => { setChoreModal(null); onDataChanged(); }}
          onCancel={() => setChoreModal(null)}
        />
      )}
      {editingCompletion && (
        <CompletionEditModal
          completion={editingCompletion}
          onSave={() => {
            setEditingCompletion(null);
            onDataChanged();
            fetchCompletions(compSearch, 0, false);
          }}
          onCancel={() => setEditingCompletion(null)}
        />
      )}

      {/* ── Section: Chores ── */}
      <section className="manage-section">
        <div className="manage-section__header">
          <h2 className="manage-section__title">Chores</h2>
          <button className="btn btn--add" onClick={() => setChoreModal('new')}>
            + Add chore
          </button>
        </div>

        {FREQUENCY_ORDER.map((freq) => {
          const group = grouped[freq];
          if (!group?.length) return null;
          return (
            <div key={freq} className="manage-freq-group">
              <div className="manage-freq-label">{FREQUENCY_LABELS[freq]}</div>
              {group.map((chore) => (
                <div key={chore.id} className="manage-row">
                  <div className="manage-row__info">
                    <span className="manage-row__name">{chore.name}</span>
                    <span className={`owner-badge owner-badge--${chore.owner}`}>
                      {chore.owner === 'daniel'  ? 'Daniel'   :
                       chore.owner === 'crimson' ? 'Crimson'  :
                       chore.owner === 'both'    ? 'Both'     : 'Flexible'}
                    </span>
                    {chore.notes && (
                      <span className="manage-row__notes">{chore.notes}</span>
                    )}
                  </div>
                  <div className="manage-row__actions">
                    <button
                      className="btn btn--icon"
                      title="Edit chore"
                      onClick={() => setChoreModal(chore)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn--icon btn--icon-danger"
                      title="Delete chore"
                      onClick={() => handleChoreDeleted(chore)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </section>

      {/* ── Section: Log Entries ── */}
      <section className="manage-section">
        <div className="manage-section__header">
          <h2 className="manage-section__title">Log Entries</h2>
        </div>

        {/* Search */}
        <div className="history-search" style={{ marginBottom: 12 }}>
          <input
            type="search"
            className="history-search__input"
            placeholder="Search chores or notes…"
            value={compSearch}
            onChange={(e) => setCompSearch(e.target.value)}
          />
          {compSearch && (
            <button className="history-search__clear" onClick={() => setCompSearch('')}>✕</button>
          )}
        </div>

        {completions.length === 0 && !compLoading ? (
          <div className="history-log--empty">
            {compSearch ? 'No entries match your search.' : 'No completions recorded yet.'}
          </div>
        ) : (
          <div className="history-log">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Chore</th>
                  <th>By</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {completions.map((c) => (
                  <tr key={c.id} className={`history-row history-row--${c.completedBy}`}>
                    <td className="history-row__time">{formatDateTime(c.timestamp)}</td>
                    <td>{c.choreName}</td>
                    <td>
                      <span className={`owner-badge owner-badge--${c.completedBy}`}>
                        {PERSON_LABELS[c.completedBy] ?? c.completedBy}
                      </span>
                    </td>
                    <td className="history-row__notes">{c.notes || '—'}</td>
                    <td className="manage-row__actions manage-row__actions--inline">
                      <button
                        className="btn btn--icon"
                        title="Edit entry"
                        onClick={() => setEditingCompletion(c)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn--icon btn--icon-danger"
                        title="Delete entry"
                        onClick={() => handleCompletionDeleted(c)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {compHasMore && (
              <div className="history-load-more">
                <button
                  className="btn btn--load-more"
                  onClick={() => fetchCompletions(compSearch, compOffset, true)}
                  disabled={compLoading}
                >
                  {compLoading ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
