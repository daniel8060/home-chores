const OWNER_LABELS = {
  daniel: 'Daniel',
  crimson: 'Crimson',
  both: 'Both',
  flexible: 'Flexible',
};

export default function OwnerBadge({ owner }) {
  return (
    <span className={`owner-badge owner-badge--${owner}`}>
      {OWNER_LABELS[owner] ?? owner}
    </span>
  );
}
