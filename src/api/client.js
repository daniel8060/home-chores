const BASE = '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${method} ${path} → ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const apiGet    = (path)        => request('GET',    path);
export const apiPost   = (path, body)  => request('POST',   path, body);
export const apiPut    = (path, body)  => request('PUT',    path, body);
export const apiDelete = (path)        => request('DELETE', path);

/**
 * Parse a YYYY-MM-DD date string as local noon.
 * Using noon avoids UTC-offset issues where new Date('2026-03-16') would be
 * interpreted as UTC midnight, potentially landing on the previous local day.
 */
function dateToLocalTimestamp(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0).getTime();
}

/**
 * Map a raw completion row from the API to the shape the frontend expects.
 * Adds a `timestamp` (Unix ms) field for backward-compat with time.js utilities.
 */
export function mapCompletion(row) {
  return {
    id:          row.id,
    choreId:     row.chore_id,
    choreName:   row.chore_name,
    completedBy: row.completed_by,
    completedAt: row.completed_at,                      // YYYY-MM-DD
    timestamp:   dateToLocalTimestamp(row.completed_at), // local noon ms
    notes:       row.notes || '',
  };
}
