export default function TrustRing({ value = 0 }) {
  const r = 40, c = 2 * Math.PI * r;
  return (
    <div className="ring" role="img" aria-label={`Trust score ${value} out of 100`}>
      <svg viewBox="0 0 100 100" width="96" height="96">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#EEF0F6" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--brand)" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`} transform="rotate(-90 50 50)" />
      </svg>
      <b>{value}</b>
    </div>
  );
}
