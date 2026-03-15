import { startOfWeek } from '../utils/time';

const WEEK_START = startOfWeek();

export default function Dashboard({ completions }) {
  const weeklyCompletions = completions.filter((c) => c.timestamp >= WEEK_START);

  const danielCount = weeklyCompletions.filter((c) => c.completedBy === 'daniel').length;
  const crimsonCount = weeklyCompletions.filter((c) => c.completedBy === 'crimson').length;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">This Week</h2>
      <div className="stat-cards">
        <div className="stat-card stat-card--daniel">
          <div className="stat-card__label">Daniel</div>
          <div className="stat-card__count">{danielCount}</div>
          <div className="stat-card__sub">chores done</div>
        </div>
        <div className="stat-card stat-card--crimson">
          <div className="stat-card__label">Crimson</div>
          <div className="stat-card__count">{crimsonCount}</div>
          <div className="stat-card__sub">chores done</div>
        </div>
      </div>
    </div>
  );
}
