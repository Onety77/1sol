import { Link } from 'react-router-dom';
import { beliefs as beliefApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useState, useRef } from 'react';

const STATE_META = {
  alive:       { label: 'Alive',       icon: '◉', color: '#00FFD1', rgb: '0,255,209' },
  fading:      { label: 'Fading',      icon: '⚠', color: '#FF1F5A', rgb: '255,31,90' },
  grey:        { label: 'Faded',       icon: '✕', color: '#3A3A5A', rgb: '58,58,90' },
  resurrected: { label: 'Resurrected', icon: '⚡', color: '#BF5FFF', rgb: '191,95,255' },
  crowned:     { label: 'Crowned',     icon: '♛', color: '#FFD700', rgb: '255,215,0' },
};

const MOOD_EMOJI = {
  Serious: '🎯', Funny: '😂', Delusional: '🌀', Beautiful: '✨',
  Degenerate: '🔥', Impossible: '🚀', Unfinished: '⏳',
};

function hashTilt(str) {
  let h = 0;
  for (let i = 0; i < (str?.length || 0); i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return ((h & 0xFF) / 255) * 2.6 - 1.3;
}

export default function DreamCard({ dream, myBeliefs = [], onBelief, rank, compact = false }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [localCount, setLocalCount] = useState(dream.beliefCount || 0);
  const [believed, setBelieved] = useState(myBeliefs.includes(dream.id));
  const cardRef = useRef(null);

  const state      = dream.state || 'alive';
  const meta       = STATE_META[state] || STATE_META.alive;
  const isOwn      = user?.userId === dream.userId;
  const canBelieve = user && !isOwn && !believed && state !== 'grey';
  const isGrey     = state === 'grey';

  const glowLevel  = Math.min(localCount, 40) / 40;
  const tilt       = hashTilt(dream.id);
  const stripeAlpha = isGrey ? 0.08 : 0.6 + glowLevel * 0.3;
  const glowSpread  = 22 + glowLevel * 46;
  const glowAlpha   = 0.1 + glowLevel * 0.22;

  const handleBelieve = async e => {
    e.preventDefault();
    if (!user || believed || loading) return;
    setLoading(true);
    try {
      await beliefApi.place(dream.id);
      setBelieved(true);
      setLocalCount(c => c + 1);
      onBelief?.();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to place belief');
    } finally { setLoading(false); }
  };

  const handleMouseMove = e => {
    if (!cardRef.current || compact) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    cardRef.current.style.transform =
      `rotate(${tilt}deg) perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-8px)`;
  };
  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `rotate(${tilt}deg)`;
  };

  /* ── COMPACT: horizontal strip ────────────────────────────────────── */
  if (compact) {
    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '11px 14px',
          borderLeft: `3px solid rgba(${meta.rgb},${stripeAlpha})`,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 0,
          background: isGrey ? 'rgba(5,5,12,0.6)' : 'rgba(255,255,255,0.025)',
          boxShadow: isGrey ? 'none' : `-4px 0 ${glowSpread * 0.5}px rgba(${meta.rgb},${glowAlpha * 0.7})`,
          transform: `rotate(${tilt * 0.4}deg)`,
          transition: 'transform 0.15s ease-out',
          filter: isGrey ? 'grayscale(80%) brightness(0.48)' : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Corner cut */}
        <div style={{
          position: 'absolute', bottom: -1, right: -1, width: 14, height: 14,
          background: 'var(--void)',
          clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
          zIndex: 10, pointerEvents: 'none',
        }} />

        {rank !== undefined && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-3)',
            flexShrink: 0, minWidth: 22, letterSpacing: '0.06em',
          }}>#{rank}</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700,
            color: state === 'crowned' ? 'var(--gold)' : isGrey ? 'var(--text-3)' : 'var(--text)',
            lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{dream.title}</p>
          <p style={{ fontSize: '0.62rem', color: 'var(--text-3)', marginTop: 2 }}>
            @{dream.username}
          </p>
        </div>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 900, flexShrink: 0,
          fontSize: '1rem', lineHeight: 1,
          color: localCount > 0 ? 'var(--gold)' : 'var(--text-3)',
          textShadow: localCount > 5 ? '0 0 16px rgba(255,215,0,0.5)' : 'none',
        }}>{believed ? '★' : '☆'} {localCount}</span>
        {canBelieve && (
          <button onClick={handleBelieve} disabled={loading} className="btn btn-gold btn-sm"
            style={{ flexShrink: 0, padding: '4px 10px', fontSize: '0.7rem' }}>
            {loading ? '···' : '+'}
          </button>
        )}
      </div>
    );
  }

  /* ── FULL card ─────────────────────────────────────────────────────── */
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', gap: 14,
        padding: '20px 22px 18px 20px',
        borderRadius: 0,
        cursor: 'default',
        overflow: 'hidden',
        background: isGrey
          ? 'rgba(5,5,12,0.8)'
          : 'rgba(255,255,255,0.033)',
        borderLeft: `3px solid rgba(${meta.rgb},${stripeAlpha})`,
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: isGrey
          ? '0 6px 28px rgba(0,0,0,0.55)'
          : `-8px 0 ${glowSpread}px rgba(${meta.rgb},${glowAlpha}), 0 8px 28px rgba(0,0,0,0.45)`,
        transform: `rotate(${tilt}deg)`,
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease-out',
        willChange: 'transform',
        filter: isGrey ? 'grayscale(85%) brightness(0.48)' : 'none',
      }}
    >
      {/* Bottom-right corner cut — illusion via page-bg overlay */}
      <div style={{
        position: 'absolute', bottom: -1, right: -1, width: 22, height: 22,
        background: 'var(--void)',
        clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
        zIndex: 10, pointerEvents: 'none',
      }} />

      {/* Rank watermark */}
      {rank !== undefined && (
        <div style={{
          position: 'absolute', right: 28, bottom: 14,
          fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 1,
          fontSize: rank <= 3 ? '4.5rem' : '2.8rem',
          color: rank <= 3 ? `rgba(${meta.rgb},0.07)` : 'rgba(255,255,255,0.03)',
          pointerEvents: 'none', userSelect: 'none', zIndex: 0,
        }}>
          {rank <= 3 ? rank : `#${rank}`}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, zIndex: 1 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 700,
            color: meta.color, letterSpacing: '0.14em', textTransform: 'uppercase',
            textShadow: isGrey ? 'none' : `0 0 10px rgba(${meta.rgb},0.65)`,
          }}>{meta.icon} {meta.label}</span>
          <span className={`tag mood-${dream.mood}`} style={{ fontSize: '0.58rem' }}>
            {MOOD_EMOJI[dream.mood]} {dream.mood}
          </span>
        </div>

        {/* Belief count — prominent */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 1,
            fontSize: localCount >= 10 ? '1.7rem' : '1.4rem',
            color: localCount > 0 ? 'var(--gold)' : 'var(--text-3)',
            textShadow: localCount > 5 ? '0 0 28px rgba(255,215,0,0.55)' : 'none',
          }}>{believed ? '★' : '☆'} {localCount}</span>
          <span style={{
            fontSize: '0.5rem', color: 'var(--text-3)',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', marginTop: 1,
          }}>BELIEFS</span>
        </div>
      </div>

      {/* ── Title ── */}
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: '0.92rem', lineHeight: 1.28,
        color: isGrey ? 'var(--text-3)' : state === 'crowned' ? 'var(--gold)' : 'var(--text)',
        textShadow: state === 'crowned' ? '0 0 20px rgba(255,215,0,0.22)' : 'none',
        zIndex: 1,
      }}>{dream.title}</h3>

      {/* ── Story ── */}
      <p style={{
        fontSize: '0.8rem', lineHeight: 1.65, zIndex: 1,
        color: isGrey ? 'var(--text-3)' : 'var(--text-2)',
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{dream.story}</p>

      {/* ── Perforated divider ── */}
      <div style={{
        borderTop: `1px dashed rgba(${meta.rgb}, ${isGrey ? 0.04 : 0.18})`,
        margin: '0 -2px',
      }} />

      {/* ── Footer ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
        <Link
          to={`/profile/${dream.walletAddress}`}
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: '0.72rem' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; }}
        >
          <div style={{
            width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg,
              hsl(${((dream.walletAddress?.charCodeAt(0) || 0) * 7) % 360},65%,55%),
              hsl(${((dream.walletAddress?.charCodeAt(2) || 0) * 11) % 360},65%,45%))`,
          }} />
          @{dream.username}
          {(dream.proofImageUrl || dream.proofLink) && (
            <span style={{ opacity: 0.45, marginLeft: 2, fontSize: '0.7rem' }}>
              {dream.proofImageUrl ? '📸' : '🔗'}
            </span>
          )}
        </Link>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {canBelieve && (
            <button onClick={handleBelieve} disabled={loading} className="btn btn-gold btn-sm">
              {loading ? '···' : 'Believe'}
            </button>
          )}
          {believed && (
            <span style={{ fontSize: '0.68rem', color: 'var(--gold)', fontWeight: 700, textShadow: '0 0 8px rgba(255,215,0,0.45)' }}>
              ✓ Believed
            </span>
          )}
          {!canBelieve && !believed && !isOwn && !user && (
            <Link to="/signup" style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Join →</Link>
          )}
        </div>
      </div>
    </div>
  );
}
