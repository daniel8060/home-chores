import { useState, useEffect, useRef } from 'react';
import { apiGet, mapCompletion } from '../api/client';
import { formatDateTime } from '../utils/time';

const PERSON_LABELS = { daniel: 'Daniel', crimson: 'Crimson' };
const PAGE_SIZE = 50;

/**
 * Self-contained history log that fetches its own data.
 * refreshToken — increment this from the parent to trigger a reload
 *   (e.g. after a new completion or after clearing history).
 */
export default function HistoryLog({ refreshToken }) {
  const [completions, setCompletions] = useState([]);
  const [search, setSearch]           = useState('');
  const [offset, setOffset]           = useState(0);
  const [hasMore, setHasMore]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const debounceRef = useRef(null);

  // Fetch helper: reset offset, replace list
  const fetchCompletions = (q, off = 0, append = false) => {
    setLoading(true);
    const params = new URLSearchParams({
      search: q,
      limit:  PAGE_SIZE + 1, // fetch one extra to detect hasMore
      offset: off,
    });
    apiGet(`/completions?${params}`)
      .then((rows) => {
        const hasNextPage = rows.length > PAGE_SIZE;
        const mapped = rows.slice(0, PAGE_SIZE).map(mapCompletion);
        setCompletions((prev) => append ? [...prev, ...mapped] : mapped);
        setHasMore(hasNextPage);
        setOffset(off + PAGE_SIZE);
      })
      .finally(() => setLoading(false));
  };

  // Re-fetch when search changes (debounced) or refreshToken changes
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCompletions(search, 0, false);
    }, search ? 250 : 0);
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, refreshToken]);

  const loadMore = () => fetchCompletions(search, offset, true);

  if (!loading && completions.length === 0) {
    return (
      <>
        <SearchBar value={search} onChange={(v) => setSearch(v)} />
        <div className="history-log history-log--empty">
          {search ? 'No completions match your search.' : 'No completions recorded yet.'}
        </div>
      </>
    );
  }

  return (
    <>
      <SearchBar value={search} onChange={(v) => setSearch(v)} />
      <div className="history-log">
        <table className="history-table">
          <thead>
            <tr>
              <th>Chore</th>
              <th>Done by</th>
              <th>When</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {completions.map((c) => (
              <tr key={c.id} className={`history-row history-row--${c.completedBy}`}>
                <td>{c.choreName}</td>
                <td>
                  <span className={`owner-badge owner-badge--${c.completedBy}`}>
                    {PERSON_LABELS[c.completedBy] ?? c.completedBy}
                  </span>
                </td>
                <td className="history-row__time">{formatDateTime(c.timestamp)}</td>
                <td className="history-row__notes">{c.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {hasMore && (
          <div className="history-load-more">
            <button className="btn btn--load-more" onClick={loadMore} disabled={loading}>
              {loading ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div className="history-search">
      <input
        type="search"
        className="history-search__input"
        placeholder="Search chores or notes…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search history"
      />
      {value && (
        <button
          className="history-search__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
