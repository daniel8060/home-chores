import { formatDateTime } from '../utils/time';

const PERSON_LABELS = { daniel: 'Daniel', crimson: 'Crimson' };

export default function HistoryLog({ completions, chores }) {
  const choreMap = Object.fromEntries(chores.map((c) => [c.id, c]));

  const recent = [...completions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 30);

  if (recent.length === 0) {
    return (
      <div className="history-log history-log--empty">
        No completions recorded yet.
      </div>
    );
  }

  return (
    <div className="history-log">
      <table className="history-table">
        <thead>
          <tr>
            <th>Chore</th>
            <th>Done by</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((c, i) => {
            const chore = choreMap[c.choreId];
            return (
              <tr key={i} className={`history-row history-row--${c.completedBy}`}>
                <td>{chore ? chore.name : c.choreId}</td>
                <td>
                  <span className={`owner-badge owner-badge--${c.completedBy}`}>
                    {PERSON_LABELS[c.completedBy] ?? c.completedBy}
                  </span>
                </td>
                <td className="history-row__time">{formatDateTime(c.timestamp)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
