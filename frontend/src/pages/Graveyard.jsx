import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dreams as dreamsApi } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const MOOD_EMOJI = { Serious: '🎯', Funny: '😂', Delusional: '🌀', Beautiful: '✨', Degenerate: '🔥', Impossible: '🚀', Unfinished: '⏳' };

function GraveCard({ dream, i }) {
  const isResurrected = dream.state === 'resurrected';
  const updatedAt = dream.updatedAt?.seconds
    ? new Date(dream.updatedAt.seconds * 1000)
    : dream.updatedAt?.toDate ? dream.updatedAt.toDate() : new Date();

  return (
    <div
      className={isResurrected ? 'dc-resurrected glass' : ''}
      style={{
        borderRadius: 'var(--r-lg)', padding: 20,
        background: isResurrected
          ? undefined
          : 'rgba(8,8,22,0.7)',
        border: isResurrected
          ? undefined
          : '1px solid rgba(255,255,255,0.035)',
        display: 'flex', flexDirection: 'column', gap: 10,
        animation: `fade-up 0.45s ease-out ${i * 0.04}s both`,
        filter: isResurrected ? 'none' : 'grayscale(60%) brightness(0.7)',
        transition: 'filter 0.3s, transform 0.25s',
      }}
      onMouseEnter={e => {
        if (isResurrected) {
          e.currentTarget.style.transform = 'translateY(-3px)';
        } else {
          e.currentTarget.style.filter = 'grayscale(40%) brightness(0.85)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.filter = isResurrected ? 'none' : 'grayscale(60%) brightness(0.7)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {isResurrected ? (
            <span style={{
              background: 'rgba(191,95,255,0.1)', color: 'var(--resurrected)',
              border: '1px solid rgba(191,95,255,0.25)',
              borderRadius: 'var(--r-full)', padding: '2px 10px',
              fontSize: '0.68rem', fontWeight: 700,
            }}>⚡ Resurrected</span>
          ) : (
            <span style={{
              background: 'rgba(20,20,40,0.8)', color: '#3A3A5A',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 'var(--r-full)', padding: '2px 10px',
              fontSize: '0.68rem', fontWeight: 700,
            }}>✕ Faded</span>
          )}
          {dream.mood && (
            <span className={`tag mood-${dream.mood}`} style={{
              fontSize: '0.64rem',
              opacity: isResurrected ? 1 : 0.4,
            }}>
              {MOOD_EMOJI[dream.mood]} {dream.mood}
            </span>
          )}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: isResurrected ? 'var(--text-3)' : '#1E1E3A' }}>
          {formatDistanceToNow(updatedAt, { addSuffix: true })}
        </span>
      </div>

      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3,
        color: isResurrected ? 'var(--resurrected)' : '#2A2A4A',
      }}>{dream.title}</h3>

      <p style={{
        fontSize: '0.78rem', lineHeight: 1.55,
        color: isResurrected ? 'var(--text-2)' : '#1E1E3A',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{dream.story}</p>

      {!isResurrected && (
        <p style={{
          fontSize: '0.7rem', color: '#161630', fontStyle: 'italic',
          borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 8,
        }}>
          This dream lost color. The dreamer sold.
        </p>
      )}
      {isResurrected && (
        <p style={{
          fontSize: '0.7rem', color: 'var(--resurrected)',
          borderTop: '1px solid rgba(191,95,255,0.15)', paddingTop: 8,
        }}>
          The dreamer returned. Competing again next round.
        </p>
      )}

      <Link to={`/profile/${dream.walletAddress}`} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        color: isResurrected ? 'var(--text-3)' : '#1A1A38',
        fontSize: '0.72rem', marginTop: 'auto',
        textDecoration: 'none',
      }}>
        <div style={{
          width: 14, height: 14, borderRadius: '50%',
          background: isResurrected ? 'var(--resurrected)' : '#1A1A38',
        }} />
        @{dream.username}
        <span style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-mono)',
          color: isResurrected ? 'var(--resurrected)' : '#1A1A38',
        }}>★ {dream.beliefCount || 0}</span>
      </Link>
    </div>
  );
}

export default function Graveyard() {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dreamsApi.graveyard().then(d => { setDreams(d.dreams || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = search
    ? dreams.filter(d => d.title?.toLowerCase().includes(search.toLowerCase()) || d.username?.toLowerCase().includes(search.toLowerCase()))
    : dreams;

  const faded = filtered.filter(d => d.state === 'grey');
  const resurrected = filtered.filter(d => d.state === 'resurrected');

  return (
    <div style={{
      minHeight: '100vh', paddingTop: 72, paddingBottom: 100,
      background: 'linear-gradient(180deg, rgba(5,5,15,1) 0%, rgba(3,3,8,1) 100%)',
    }}>

      {/* Atmospheric header */}
      <div style={{
        padding: 'clamp(48px, 6vw, 72px) 0 44px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* fog glow at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: 120,
          background: 'radial-gradient(ellipse, rgba(191,95,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16, filter: 'grayscale(80%) brightness(0.5)' }}>🪦</div>
          <p className="section-label" style={{
            justifyContent: 'center', display: 'flex', marginBottom: 8,
            color: '#2A2A4A',
          }}>The Forgotten</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800,
            color: '#3A3A5A', letterSpacing: '-0.03em',
          }}>The Graveyard</h1>
          <p style={{
            color: '#1E1E38', marginTop: 10, fontSize: '0.85rem',
            maxWidth: 420, margin: '10px auto 0', lineHeight: 1.6,
          }}>
            Dreams that lost color when their dreamers sold. Some found their way back. Most haven't.
          </p>

          {/* Search */}
          <div style={{ marginTop: 28, maxWidth: 360, margin: '28px auto 0' }}>
            <input
              className="input"
              placeholder="Search faded dreams..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'rgba(10,10,25,0.8)',
                borderColor: 'rgba(255,255,255,0.04)',
                color: '#4A4A6A',
              }}
            />
          </div>

          {/* Counts */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#2A2A4A' }}>
              <span style={{ color: '#3A3A5A', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{faded.length}</span> faded
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
              <span style={{ color: 'var(--resurrected)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{resurrected.length}</span> resurrected
            </span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 36, paddingBottom: 48 }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--r-lg)', opacity: 0.3 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: '1rem',
              color: '#2A2A4A', letterSpacing: '-0.01em',
            }}>
              {search ? 'No matching faded dreams.' : 'The graveyard is empty. For now.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {resurrected.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                    color: 'var(--resurrected)', letterSpacing: '0.15em', textTransform: 'uppercase',
                  }}>⚡ They came back</p>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(191,95,255,0.2), transparent)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {resurrected.map((d, i) => <GraveCard key={d.id} dream={d} i={i} />)}
                </div>
              </div>
            )}

            {faded.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                    color: '#2A2A4A', letterSpacing: '0.15em', textTransform: 'uppercase',
                  }}>✕ Still grey</p>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.03)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {faded.map((d, i) => <GraveCard key={d.id} dream={d} i={i} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
