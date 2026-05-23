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
  const color = isUrgent ? 'var(--fading)' : compact ? 'var(--text-2)' : 'var(--gold)';
  const pad = n => String(n).padStart(2, '0');

  if (compact) {
    return (
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color,
        letterSpacing: '0.04em',
        textShadow: isUrgent ? '0 0 8px rgba(244,63,94,0.5)' : 'none',
        transition: 'color 0.3s',
      }}>
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </span>
    );
  }

  if (large) {
    const fontSize = large === 'xl' ? '3.5rem' : '2.5rem';
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        {[{ val: time.h, label: 'hrs' }, { val: time.m, label: 'min' }, { val: time.s, label: 'sec' }].map(({ val, label }, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-end', gap: i < 2 ? 12 : 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize,
                fontWeight: 700, color,
                lineHeight: 1,
                textShadow: `0 0 30px ${isUrgent ? 'rgba(244,63,94,0.4)' : 'rgba(251,191,36,0.3)'}`,
                transition: 'color 0.3s, text-shadow 0.3s',
                minWidth: fontSize === '3.5rem' ? 88 : 64,
              }}>{pad(val)}</div>
              <div style={{
                fontSize: '0.62rem', color: 'var(--text-3)',
                letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 6,
                fontFamily: 'var(--font-mono)',
              }}>{label}</div>
            </div>
            {i < 2 && (
              <div style={{
                color: 'var(--text-3)', marginBottom: 20, fontSize: '1.5rem',
                fontFamily: 'var(--font-mono)',
                animation: 'glow-pulse 1s ease-in-out infinite',
              }}>:</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {[{ val: time.h, label: 'h' }, { val: time.m, label: 'm' }, { val: time.s, label: 's' }].map(({ val, label }, i) => (
        <span key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          {i > 0 && <span style={{ color: 'var(--text-3)', margin: '0 1px', fontFamily: 'var(--font-mono)' }}>:</span>}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color, fontWeight: 700 }}>{pad(val)}</span>
        </span>
      ))}
    </div>
  );
}
