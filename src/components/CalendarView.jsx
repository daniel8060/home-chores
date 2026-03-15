import { useState, useMemo, useRef, useCallback } from 'react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toDateKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayKey() {
  return toDateKey(Date.now());
}

/** Returns {year, month} for today */
function currentYM() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() }; // month 0-indexed
}

/** All day keys in a given month, plus leading/trailing nulls to fill the Mon-Sun grid */
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday = 0 offset
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0 … Sun=6

  const cells = [];
  // Leading empty cells
  for (let i = 0; i < startOffset; i++) cells.push(null);
  // Days of month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    cells.push(toDateKey(date.getTime()));
  }
  // Trailing empty cells to complete last row
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarView({ completions, chores }) {
  const [{ year, month }, setYM] = useState(currentYM);
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const detailRef = useRef(null);

  const selectDay = useCallback((dateKey) => {
    setSelectedDay(dateKey);
    if (dateKey) {
      // Let React render the panel first, then scroll it into view
      requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, []);

  const choreMap = useMemo(
    () => Object.fromEntries(chores.map((c) => [c.id, c])),
    [chores],
  );

  // Group completions by date key
  const byDay = useMemo(() => {
    const map = {};
    for (const c of completions) {
      const key = toDateKey(c.timestamp);
      if (!map[key]) map[key] = [];
      map[key].push(c);
    }
    return map;
  }, [completions]);

  const grid = useMemo(() => buildCalendarGrid(year, month), [year, month]);

  const prevMonth = () => {
    setYM(({ year: y, month: m }) =>
      m === 0 ? { year: y - 1, month: 11 } : { year: y, month: m - 1 },
    );
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setYM(({ year: y, month: m }) =>
      m === 11 ? { year: y + 1, month: 0 } : { year: y, month: m + 1 },
    );
    setSelectedDay(null);
  };
  const goToday = () => {
    setYM(currentYM());
    setSelectedDay(todayKey());
  };

  const today = todayKey();
  const selectedCompletions = selectedDay ? (byDay[selectedDay] || []) : [];

  return (
    <div className="calendar-wrap">
      {/* Month navigation */}
      <div className="cal-nav">
        <button className="cal-nav__arrow" onClick={prevMonth} aria-label="Previous month">‹</button>
        <div className="cal-nav__title">
          {MONTH_NAMES[month]} {year}
        </div>
        <button className="cal-nav__arrow" onClick={nextMonth} aria-label="Next month">›</button>
        <button className="cal-nav__today" onClick={goToday}>Today</button>
      </div>

      {/* Grid */}
      <div className="cal-grid">
        {DAY_LABELS.map((d) => (
          <div key={d} className="cal-grid__header">{d}</div>
        ))}
        {grid.map((dateKey, i) => {
          if (!dateKey) return <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />;

          const dayCounts = byDay[dateKey] || [];
          const danielCount = dayCounts.filter((c) => c.completedBy === 'daniel').length;
          const crimsonCount = dayCounts.filter((c) => c.completedBy === 'crimson').length;
          const isToday = dateKey === today;
          const isSelected = dateKey === selectedDay;
          const hasDone = dayCounts.length > 0;

          return (
            <button
              key={dateKey}
              className={[
                'cal-cell',
                isToday ? 'cal-cell--today' : '',
                isSelected ? 'cal-cell--selected' : '',
                hasDone ? 'cal-cell--has-done' : '',
              ].join(' ')}
              onClick={() => selectDay(dateKey)}
            >
              <span className="cal-cell__day">{parseInt(dateKey.split('-')[2], 10)}</span>
              {hasDone && (
                <div className="cal-cell__dots">
                  {danielCount > 0 && (
                    <span className="cal-dot cal-dot--daniel" title={`Daniel: ${danielCount}`}>
                      {danielCount > 1 ? danielCount : ''}
                    </span>
                  )}
                  {crimsonCount > 0 && (
                    <span className="cal-dot cal-dot--crimson" title={`Crimson: ${crimsonCount}`}>
                      {crimsonCount > 1 ? crimsonCount : ''}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="cal-detail" ref={detailRef}>
          <div className="cal-detail__heading">
            <span>{formatSelectedDay(selectedDay)}</span>
            <div className="cal-detail__heading-right">
              {selectedCompletions.length === 0 && (
                <span className="cal-detail__empty">Nothing logged</span>
              )}
              <button className="cal-detail__close" onClick={() => setSelectedDay(null)} aria-label="Close">✕</button>
            </div>
          </div>
          {selectedCompletions.length > 0 && (
            <ul className="cal-detail__list">
              {[...selectedCompletions]
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((c, i) => {
                  const chore = choreMap[c.choreId];
                  return (
                    <li key={i} className={`cal-detail__item cal-detail__item--${c.completedBy}`}>
                      <span className={`owner-badge owner-badge--${c.completedBy}`}>
                        {c.completedBy === 'daniel' ? 'Daniel' : 'Crimson'}
                      </span>
                      <span className="cal-detail__chore-name">
                        {chore ? chore.name : c.choreId}
                      </span>
                      <span className="cal-detail__time">
                        {new Date(c.timestamp).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function formatSelectedDay(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
