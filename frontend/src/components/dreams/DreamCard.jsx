import { Link } from 'react-router-dom';
import { beliefs as beliefApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

const STATE_LABELS = {
  alive: { label: 'Alive', color: 'var(--mint)' },
  fading: { label: 'Fading', color: 'var(--coral)' },
  grey: { label: 'Faded', color: 'var(--text-3)' },
  resurrected: { label: 'Resurrected', color: 'var(--purple)' },
  crowned: { label: 'Crowned', color: 'var(--gold)' },
};

const MOOD_EMOJI = {
  Serious: '🎯', Funny: '😂', Delusional: '🌀', Beautiful: '✨',
  Degenerate: '🔥', Impossible: '🚀', Unfinished: '⏳',
};

export default function DreamCard({ dream, myBeliefs = [], onBelief, rank, compact = false }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [localCount, setLocalCount] = useState(dream.beliefCount || 0);
  const [believed, setBelieved] = useState(myBeliefs.includes(dream.id));

  const state = dream.state || 'alive';
  const stateInfo = STATE_LABELS[state] || STATE_LABELS.alive;

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

  const isOwn = user?.userId === dream.userId;
  const canBelieve = user && !isOwn && !believed && state !== 'grey';

  return (
    <div
      className={`card dream-${state} fade-in`}
      style={{
        background: state === 'grey' ? '#0A0A1E' : state === 'crowned' ? 'linear-gradient(135deg, rgba(26,18,4,0.95), rgba(18,18,58,0.95))' : 'var(--surface)',
        padding: compact ? '16px' : '22px',
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { if (state !== 'grey') e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      {/* Rank badge */}
      {rank !== undefined && (
        <div style={{
          position: 'absolute', top: -10, left: -10,
          width: 32, height: 32, borderRadius: '50%',
          background: rank === 1 ? 'var(--gold)' : rank === 2 ? '#C0C0C0' : '#CD7F32',
          color: rank === 1 ? 'var(--void)' : '#fff',
          fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: rank === 1 ? '0 0 16px rgba(255,209,102,0.5)' : 'none',
          zIndex: 2,
        }}>#{rank}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`tag mood-${dream.mood}`} style={{ fontSize: '0.7rem' }}>
            {MOOD_EMOJI[dream.mood]} {dream.mood}
          </span>
          <span style={{ fontSize: '0.7rem', color: stateInfo.color, fontWeight: 600 }}>
            {state === 'crowned' ? '👑' : state === 'resurrected' ? '⚡' : state === 'grey' ? '💀' : state === 'fading' ? '⚠️' : '●'} {stateInfo.label}
          </span>
        </div>
        {/* Proof badges */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {dream.proofImageUrl && <span title="Photo proof" style={{ fontSize: '0.75rem' }}>📸</span>}
          {dream.proofLink && <span title="Link proof" style={{ fontSize: '0.75rem' }}>🔗</span>}
        </div>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: compact ? '0.88rem' : '1rem',
        lineHeight: 1.3, color: state === 'grey' ? 'var(--text-3)' : 'var(--text)',
        zIndex: 1, position: 'relative',
      }}>
        {dream.title}
      </h3>

      {/* Story */}
      {!compact && (
        <p style={{
          fontSize: '0.85rem', color: state === 'grey' ? 'var(--text-3)' : 'var(--text-2)',
          lineHeight: 1.55, zIndex: 1, position: 'relative',
        }}>
          {dream.story}
        </p>
      )}

      {/* Grey state message */}
      {state === 'grey' && (
        <p style={{
          fontSize: '0.75rem', color: 'var(--text-3)', fontStyle: 'italic',
          borderTop: '1px solid #1A1A2A', paddingTop: 8, zIndex: 1, position: 'relative',
        }}>
          This dream lost color because the dreamer sold.
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', zIndex: 1, position: 'relative' }}>
        <Link
          to={`/profile/${dream.walletAddress}`}
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-3)', fontSize: '0.78rem' }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: `linear-gradient(135deg, hsl(${dream.walletAddress?.charCodeAt(0) * 7 % 360},70%,50%), hsl(${dream.walletAddress?.charCodeAt(2) * 11 % 360},70%,40%))`,
          }} />
          @{dream.username}
        </Link>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: believed ? 'var(--gold)' : 'var(--text-2)' }}>
            {believed ? '★' : '☆'} {localCount}
          </span>
          {canBelieve && (
            <button
              onClick={handleBelieve}
              disabled={loading}
              className="btn btn-sm"
              style={{
                background: 'var(--gold-glow)', color: 'var(--gold)',
                border: '1px solid rgba(255,209,102,0.3)', fontWeight: 600,
              }}
            >
              {loading ? '...' : 'Believe'}
            </button>
          )}
          {believed && (
            <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600 }}>Believed ✓</span>
          )}
        </div>
      </div>
    </div>
  );
}
