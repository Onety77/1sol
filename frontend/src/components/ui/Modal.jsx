import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, maxWidth = 520 }) {
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(3,3,8,0.82)',
        backdropFilter: 'blur(16px) saturate(150%)',
        WebkitBackdropFilter: 'blur(16px) saturate(150%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(13,13,40,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--r-xl)', padding: '32px',
          width: '100%', maxWidth,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 120px rgba(0,0,0,0.8)',
          animation: 'scale-in 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Top glow line */}
        <div style={{
          position: 'absolute', top: 0, left: '25%', right: '25%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700,
            letterSpacing: '-0.01em',
          }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 'var(--r-md)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
