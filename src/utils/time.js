import { FREQUENCY_DAYS } from '../data/chores';

/**
 * Returns a human-readable "X ago" label for a timestamp.
 */
export function timeAgo(timestamp) {
  if (!timestamp) return null;
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

/**
 * Returns true if a chore is overdue based on its last completion and frequency.
 */
export function isOverdue(chore, lastCompletion) {
  if (!lastCompletion) return true; // never done = overdue
  const graceDays = FREQUENCY_DAYS[chore.frequency];
  if (!graceDays) return false;
  const msSinceCompletion = Date.now() - lastCompletion.timestamp;
  const daysSince = msSinceCompletion / 86_400_000;
  return daysSince > graceDays;
}

/**
 * Returns number of days overdue (negative means still within window).
 */
export function daysOverdue(chore, lastCompletion) {
  if (!lastCompletion) return Infinity;
  const graceDays = FREQUENCY_DAYS[chore.frequency];
  const daysSince = (Date.now() - lastCompletion.timestamp) / 86_400_000;
  return daysSince - graceDays;
}

/**
 * Start of current week (Monday 00:00:00).
 */
export function startOfWeek() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // shift so Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

/**
 * Format a timestamp as a readable date/time string.
 */
export function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Compute streak: consecutive on-time completions for a chore.
 * completions: array sorted ascending by timestamp, filtered to this chore.
 */
export function computeStreak(chore, choreCompletions) {
  if (!choreCompletions.length) return 0;
  const graceDays = FREQUENCY_DAYS[chore.frequency];
  if (!graceDays) return 0;
  const graceMs = graceDays * 86_400_000;

  // Work backwards from the most recent completion
  const sorted = [...choreCompletions].sort((a, b) => b.timestamp - a.timestamp);

  let streak = 0;
  let windowEnd = Date.now();

  for (const completion of sorted) {
    const elapsed = windowEnd - completion.timestamp;
    if (elapsed <= graceMs) {
      streak++;
      windowEnd = completion.timestamp;
    } else {
      break;
    }
  }

  return streak;
}
