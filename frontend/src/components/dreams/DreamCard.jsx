import { Link } from 'react-router-dom';
import { beliefs as beliefApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useState, useRef } from 'react';

const STATE_META = {
  alive:       { label: 'Alive',       color: 'var(--alive)',       icon: '◉' },
  fading:      { label: 'Fading',      color: 'var(--fading)',      icon: '⚠' },
  grey:        { label: 'Faded',       color: 'var(--text-3)',      icon: '✕' },
  resurrected: { label: 'Resurrected', color: 'var(--resurrected)', icon: '⚡' },
  crowned:     { label: 'Crowned',     color: 'var(--crowned)',     icon: '♛' },
};

const MOOD_EMOJI = {
  Serious: '🎯', Funny: '😂', Delusional: '🌀', Beautiful: '✨',
  Degenerate: '🔥', Impossible: '🚀', Unfinished: '⏳',
};

const RANK_STYLE = {
  1: { bg: 'linear-gradient(135deg,#FBBF24,#F59E0B)', color: '#030308', glow: 'rgba(251,191,36,0.5)' },
  2: { bg: 'linear-gradient(135deg,#C0C0D0,#A0A0B0)', color: '#030308', glow: 'rgba(192,192,208,0.4)' },
  3: { bg: 'linear-gradient(135deg,#CD7F32,#A0622A)', color: '#fff',    glow: 'rgba(205,127,50,0.4)' },
};

export default function DreamCard({ dream, myBeliefs = [], onBelief, rank, compact = false }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [localCount, setLocalCount] = useState(dream.beliefCount || 0);
  const [believed, setBelieved] = useState(myBeliefs.includes(dream.id));
  const cardRef = useRef(null);

  const state = dream.state || 'alive';
  const meta = STATE_META[state] || STATE_META.alive;
  const isOwn = user?.userId === dream.userId;
  const canBelieve = user && !isOwn && !believed && state !== 'grey';

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
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.setProperty('--rx', `${(-y * 6).toFixed(2)}`);
    cardRef.current.style.setProperty('--ry', `${(x * 6).toFixed(2)}`);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--rx', '0');
    cardRef.current.style.setProperty('--ry', '0');
  };

  const rankInfo = RANK_STYLE[rank];

  return (
    <div
      ref={cardRef}
      className={`glass card-3d dc-${state} fade-in`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        padding: compact ? '16px' : '22px',
        position: 'relative', display: 'flex', flexDirection: 'column', gap: compact ? 10 : 14,
        borderRadius: 'var(--r-lg)',
        cursor: 'default',
        overflow: 'hidden',
      }}
    >
      {/* Subtle inner shimmer top edge */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
        background: `linear-gradient(90deg, transparent, ${meta.color}40, transparent)`,
        pointerEvents: 'none',
      }} />

      {/* Rank badge */}
      {rank !== undefined && rankInfo && (
        <div style={{
          position: 'absolute', top: -8, left: -8, zIndex: 2,
          width: 30, height: 30, borderRadius: '50%',
          background: rankInfo.bg,
          color: rankInfo.color,
          fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 12px ${rankInfo.glow}`,
        }}>{rank}</div>
      )}
      {rank !== undefined && rank > 3 && (
        <div style={{
          position: 'absolute', top: -8, left: -8, zIndex: 2,
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'var(--text-3)',
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>#{rank}</div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`tag mood-${dream.mood}`} style={{ fontSize: '0.65rem' }}>
            {MOOD_EMOJI[dream.mood]} {dream.mood}
          </span>
          <span style={{
            fontSize: '0.65rem', color: meta.color, fontWeight: 700,
            fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 3,
          }}>
            {meta.icon} {meta.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, opacity: 0.7 }}>
          {dream.proofImageUrl && <span style={{ fontSize: '0.75rem' }}>📸</span>}
          {dream.proofLink && <span style={{ fontSize: '0.75rem' }}>🔗</span>}
        </div>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: compact ? '0.82rem' : '0.95rem',
        lineHeight: 1.3,
        color: state === 'grey' ? 'var(--text-3)' : state === 'crowned' ? 'var(--crowned)' : 'var(--text)',
        zIndex: 1,
      }}>
        {dream.title}
      </h3>

      {/* Story */}
      {!compact && (
        <p style={{
          fontSize: '0.83rem', color: state === 'grey' ? 'var(--text-3)' : 'var(--text-2)',
          lineHeight: 1.6, zIndex: 1,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {dream.story}
        </p>
      )}

      {/* Grey message */}
      {state === 'grey' && (
        <p style={{
          fontSize: '0.72rem', color: 'var(--text-3)', fontStyle: 'italic',
          borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8,
        }}>
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
          style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-3)', fontSize: '0.76rem' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, hsl(${(dream.walletAddress?.charCodeAt(0) || 0) * 7 % 360},65%,55%), hsl(${(dream.walletAddress?.charCodeAt(2) || 0) * 11 % 360},65%,45%))`,
          }} />
          @{dream.username}
        </Link>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
            color: believed ? 'var(--gold)' : 'var(--text-3)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {believed ? '★' : '☆'} {localCount}
          </span>

          {canBelieve && (
            <button
              onClick={handleBelieve}
              disabled={loading}
              className="btn btn-gold btn-sm"
            >
              {loading ? '···' : 'Believe'}
            </button>
          )}
          {believed && (
            <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700 }}>Believed ✓</span>
          )}
        </div>
      </div>
    </div>
  );
}
