import { FREQUENCY_DAYS } from '../data/chores';

/**
 * Returns a human-readable label for a timestamp.
 * Since completions only have date granularity, sub-day labels are omitted.
 */
export function timeAgo(timestamp) {
  if (!timestamp) return null;
  const now = new Date();
  const d = new Date(timestamp);
  // Compare calendar dates (local time) to avoid "yesterday" at 11:55 PM
  const todayStart   = new Date(now.getFullYear(),   now.getMonth(),   now.getDate()).getTime();
  const completedDay = new Date(d.getFullYear(),     d.getMonth(),     d.getDate()).getTime();
  const diffDays = Math.round((todayStart - completedDay) / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 14)  return `${diffDays} days ago`;
  if (diffDays < 21)  return '2 weeks ago';
  if (diffDays < 60)  return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 45)  return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
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
 * Format a timestamp as a readable date string (no time).
 */
export function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
