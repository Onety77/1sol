import { useState, useEffect } from 'react';

function getTimeLeft(endsAt) {
  if (!endsAt) return null;
  const end = endsAt?.toDate ? endsAt.toDate() : endsAt?.seconds ? new Date(endsAt.seconds * 1000) : new Date(endsAt);
  const diff = end - Date.now();
  if (diff <= 0) return { h: 0, m: 0, s: 0, total: 0 };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, total: diff };
}

export default function CountdownTimer({ endsAt, compact = false, large = false }) {
  const [time, setTime] = useState(() => getTimeLeft(endsAt));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!time) return null;

  const isUrgent = time.total > 0 && time.total < 3600000;
  const color = isUrgent ? 'var(--coral)' : 'var(--text-2)';
  const pad = n => String(n).padStart(2, '0');

  if (compact) {
    return (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color, letterSpacing: '0.05em' }}>
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </span>
    );
  }

  if (large) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        {[{ val: time.h, label: 'hrs' }, { val: time.m, label: 'min' }, { val: time.s, label: 'sec' }].map(({ val, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: large === 'xl' ? '3.5rem' : '2.5rem',
              fontWeight: 700, color: isUrgent ? 'var(--coral)' : 'var(--gold)',
              lineHeight: 1, transition: 'color 0.3s',
            }}>{pad(val)}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[{ val: time.h, label: 'h' }, { val: time.m, label: 'm' }, { val: time.s, label: 's' }].map(({ val, label }, i) => (
        <span key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          {i > 0 && <span style={{ color: 'var(--text-3)', margin: '0 1px' }}>:</span>}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color, fontWeight: 700 }}>{pad(val)}</span>
        </span>
      ))}
    </div>
  );
}
