import { useState, useEffect, useCallback } from 'react';
import { INITIAL_CHORES } from './data/chores';
import { apiGet, apiPost, apiDelete, mapCompletion } from './api/client';
import Dashboard from './components/Dashboard';
import ChoreList from './components/ChoreList';
import HistoryLog from './components/HistoryLog';
import CalendarView from './components/CalendarView';
import './App.css';

export default function App() {
  const [chores, setChores] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tab, setTab] = useState('board');
  const [filter, setFilter] = useState('all');
  const [crimsonDayOff, setCrimsonDayOff] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Token incremented whenever a completion is added or history cleared,
  // so HistoryLog knows to refresh itself.
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Load chores + completions on mount
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [choreData, completionData] = await Promise.all([
        apiGet('/chores'),
        apiGet('/completions?limit=1000'),
      ]);
      setChores(choreData);
      setCompletions(completionData.map(mapCompletion));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addCompletion = async (choreId, choreName, completedBy, notes, completedAt) => {
    await apiPost('/completions', {
      chore_id:     choreId,
      chore_name:   choreName,
      completed_by: completedBy,
      completed_at: completedAt || new Date().toISOString(),
      notes:        notes || '',
    });
    // Reload completions so board/calendar/dashboard reflect the new entry
    const data = await apiGet('/completions?limit=1000');
    setCompletions(data.map(mapCompletion));
    setRefreshToken((t) => t + 1);
  };

  const resetData = async () => {
    if (!window.confirm('Clear all completion history? This cannot be undone.')) return;
    await apiDelete('/completions');
    setCompletions([]);
    setRefreshToken((t) => t + 1);
  };

  if (loading) {
    return (
      <div className="app app--loading">
        <div className="loading-spinner">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app app--error">
        <div className="error-card">
          <h2>Could not reach the server</h2>
          <p>{error}</p>
          <button className="btn btn--done" onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__left">
          <span className="app-header__icon">🏠</span>
          <h1 className="app-header__title">Home Chores</h1>
        </div>
        <div className="app-header__controls">
          <label className="day-off-toggle" title="Auto-reassigns litter box to Crimson for today">
            <input
              type="checkbox"
              checked={crimsonDayOff}
              onChange={(e) => setCrimsonDayOff(e.target.checked)}
            />
            <span>Crimson&apos;s day off</span>
          </label>
          <button
            className="theme-btn"
            onClick={() => setDarkMode((d) => !d)}
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <Dashboard completions={completions} />

        <nav className="tab-bar">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              className={`tab-btn ${tab === id ? 'tab-btn--active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'board' && (
          <>
            <div className="filter-bar">
              <span className="filter-bar__label">Show:</span>
              {FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  className={`filter-btn filter-btn--${id} ${filter === id ? 'filter-btn--active' : ''}`}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <ChoreList
              chores={chores}
              completions={completions}
              filter={filter}
              crimsonDayOff={crimsonDayOff}
              onAddCompletion={addCompletion}
            />
          </>
        )}

        {tab === 'calendar' && (
          <CalendarView completions={completions} chores={chores} />
        )}

        {tab === 'history' && (
          <>
            <div className="history-header">
              <span className="history-header__label">Completion history</span>
              <button className="btn btn--reset" onClick={resetData}>
                Clear history
              </button>
            </div>
            <HistoryLog refreshToken={refreshToken} />
          </>
        )}
      </main>
    </div>
  );
}

const TABS = [
  { id: 'board',    label: 'Board'    },
  { id: 'calendar', label: 'Calendar' },
  { id: 'history',  label: 'History'  },
];

const FILTERS = [
  { id: 'all',     label: 'All'     },
  { id: 'daniel',  label: 'Daniel'  },
  { id: 'crimson', label: 'Crimson' },
];
