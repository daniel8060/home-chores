import OwnerBadge from './OwnerBadge';
import { timeAgo, isOverdue, daysOverdue, computeStreak } from '../utils/time';

export default function ChoreRow({ chore, lastCompletion, choreCompletions, onMarkDone }) {
  const overdue = isOverdue(chore, lastCompletion);
  const overdueAmount = daysOverdue(chore, lastCompletion);
  const streak = computeStreak(chore, choreCompletions);
  const lastDoneLabel = lastCompletion ? timeAgo(lastCompletion.timestamp) : 'Never';

  let overdueClass = '';
  if (overdue) {
    overdueClass = overdueAmount > 2 ? 'chore-row--overdue-red' : 'chore-row--overdue-amber';
  }

  return (
    <div className={`chore-row ${overdueClass}`}>
      <div className="chore-row__info">
        <div className="chore-row__name">
          {chore.name}
          {streak >= 2 && (
            <span className="streak-badge" title={`${streak} on-time completions in a row`}>
              🔥 {streak}
            </span>
          )}
        </div>
        {chore.notes && <div className="chore-row__notes">{chore.notes}</div>}
        <div className="chore-row__meta">
          <OwnerBadge owner={chore.owner} />
          <span className="chore-row__last-done">
            {overdue && lastCompletion ? '⚠ ' : ''}Last done: {lastDoneLabel}
          </span>
        </div>
      </div>
      <button className="btn btn--done" onClick={() => onMarkDone(chore)}>
        Mark done
      </button>
    </div>
  );
}
