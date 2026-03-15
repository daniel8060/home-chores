import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_CHORES } from './data/chores';
import Dashboard from './components/Dashboard';
import ChoreList from './components/ChoreList';
import HistoryLog from './components/HistoryLog';
import CalendarView from './components/CalendarView';
import './App.css';

export default function App() {
  const [chores] = useLocalStorage('chores', INITIAL_CHORES);
  const [completions, setCompletions] = useLocalStorage('completions', []);
  const [tab, setTab] = useState('board');
  const [filter, setFilter] = useState('all');
  const [crimsonDayOff, setCrimsonDayOff] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const addCompletion = (choreId, completedBy) => {
    const entry = { choreId, completedBy, timestamp: Date.now() };
    setCompletions((prev) => [...prev, entry]);
  };

  const resetData = () => {
    if (window.confirm('Clear all completion history? This cannot be undone.')) {
      setCompletions([]);
    }
  };

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
              <span className="history-header__label">Last 30 completions</span>
              <button className="btn btn--reset" onClick={resetData}>
                Clear history
              </button>
            </div>
            <HistoryLog completions={completions} chores={chores} />
          </>
        )}
      </main>
    </div>
  );
}

const TABS = [
  { id: 'board', label: 'Board' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'history', label: 'History' },
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'daniel', label: 'Daniel' },
  { id: 'crimson', label: 'Crimson' },
];
