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

const RANK_META = {
  1: { bg: 'linear-gradient(135deg,#FFD700,#FF9900)', color: '#000',    glow: 'rgba(255,215,0,0.6)' },
  2: { bg: 'linear-gradient(135deg,#C8C8E0,#A0A0B8)', color: '#050010', glow: 'rgba(200,200,224,0.4)' },
  3: { bg: 'linear-gradient(135deg,#CD7F32,#A05020)', color: '#fff',    glow: 'rgba(205,127,50,0.4)' },
};

/* Deterministic tilt — same tilt every render for the same dream */
function hashTilt(str) {
  let h = 0;
  for (let i = 0; i < (str?.length || 0); i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return ((h & 0xFF) / 255) * 3 - 1.5; // -1.5° to +1.5°
}

export default function DreamCard({ dream, myBeliefs = [], onBelief, rank, compact = false }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [localCount, setLocalCount] = useState(dream.beliefCount || 0);
  const [believed, setBelieved] = useState(myBeliefs.includes(dream.id));
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const state   = dream.state || 'alive';
  const meta    = STATE_META[state] || STATE_META.alive;
  const isOwn   = user?.userId === dream.userId;
  const canBelieve = user && !isOwn && !believed && state !== 'grey';

  /* Belief-level glow — 0 to 1 based on beliefCount capped at 40 */
  const glowLevel  = Math.min(localCount, 40) / 40;
  const glowRadius = compact ? 0 : 20 + glowLevel * 50;
  const glowAlpha  = 0.04 + glowLevel * 0.2;
  const tilt       = hashTilt(dream.id);

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

  /* 3D tilt on mousemove */
  const handleMouseMove = e => {
    if (!cardRef.current || compact) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    cardRef.current.style.transform =
      `rotate(${tilt}deg) perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-6px) scale(1.02)`;
  };
  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `rotate(${tilt}deg)`;
    setHovered(false);
  };
  const handleMouseEnter = () => setHovered(true);

  const rankInfo = rank !== undefined && rank <= 3 ? RANK_META[rank] : null;

  return (
    <div
      ref={cardRef}
      className={`dc-${state} fade-up`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        padding: compact ? '14px' : '22px',
        position: 'relative',
        display: 'flex', flexDirection: 'column', gap: compact ? 8 : 14,
        borderRadius: 'var(--r-lg)',
        cursor: 'default',
        overflow: 'hidden',
        /* Base: glass */
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid rgba(${meta.rgb},${0.15 + glowLevel * 0.2})`,
        /* Permanent slight tilt */
        transform: `rotate(${tilt}deg)`,
        /* Outer glow based on beliefs */
        boxShadow: state !== 'grey'
          ? `0 0 ${glowRadius}px rgba(${meta.rgb},${glowAlpha}), 0 4px 20px rgba(0,0,0,0.4)`
          : '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease-out',
        willChange: 'transform',
      }}
    >
      {/* Top accent line — color matches state */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, rgba(${meta.rgb},${0.4 + glowLevel * 0.5}), transparent)`,
        pointerEvents: 'none',
      }} />

      {/* Inner glow on hover */}
      {hovered && state !== 'grey' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, rgba(${meta.rgb},0.06) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Rank badge */}
      {rankInfo && (
        <div style={{
          position: 'absolute', top: -10, left: -10, zIndex: 3,
          width: 32, height: 32, borderRadius: '50%',
          background: rankInfo.bg, color: rankInfo.color,
          fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 16px ${rankInfo.glow}`,
        }}>{rank}</div>
      )}
      {rank !== undefined && rank > 3 && (
        <div style={{
          position: 'absolute', top: -10, left: -10, zIndex: 3,
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: '0.64rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>#{rank}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`tag mood-${dream.mood}`} style={{ fontSize: '0.62rem' }}>
            {MOOD_EMOJI[dream.mood]} {dream.mood}
          </span>
          <span style={{
            fontSize: '0.62rem', color: meta.color, fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            textShadow: `0 0 8px rgba(${meta.rgb},0.5)`,
          }}>
            {meta.icon} {meta.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, opacity: 0.6 }}>
          {dream.proofImageUrl && <span style={{ fontSize: '0.75rem' }}>📸</span>}
          {dream.proofLink    && <span style={{ fontSize: '0.75rem' }}>🔗</span>}
        </div>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: compact ? '0.8rem' : '0.93rem',
        lineHeight: 1.3,
        color: state === 'grey' ? 'var(--text-3)' : state === 'crowned' ? 'var(--gold)' : 'var(--text)',
        textShadow: state === 'crowned' ? '0 0 20px rgba(255,215,0,0.2)' : 'none',
      }}>{dream.title}</h3>

      {!compact && (
        <p style={{
          fontSize: '0.82rem', lineHeight: 1.65,
          color: state === 'grey' ? 'var(--text-3)' : 'var(--text-2)',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{dream.story}</p>
      )}

      {state === 'grey' && (
        <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
          This dream lost color. The dreamer sold.
        </p>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 'auto', paddingTop: 10,
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <Link
          to={`/profile/${dream.walletAddress}`}
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-3)', fontSize: '0.74rem' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg,
              hsl(${((dream.walletAddress?.charCodeAt(0) || 0) * 7) % 360},65%,55%),
              hsl(${((dream.walletAddress?.charCodeAt(2) || 0) * 11) % 360},65%,45%))`,
          }} />
          @{dream.username}
        </Link>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Belief count with glow */}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
            color: localCount > 0 ? 'var(--gold)' : 'var(--text-3)',
            textShadow: localCount > 5 ? '0 0 10px rgba(255,215,0,0.5)' : 'none',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {believed ? '★' : '☆'} {localCount}
          </span>

          {canBelieve && (
            <button onClick={handleBelieve} disabled={loading} className="btn btn-gold btn-sm">
              {loading ? '···' : 'Believe'}
            </button>
          )}
          {believed && (
            <span style={{
              fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700,
              textShadow: '0 0 8px rgba(255,215,0,0.5)',
            }}>✓ Believed</span>
          )}
        </div>
      </div>
    </div>
  );
}
