import { useEffect, useState, useCallback } from 'react';
import { dreams as dreamsApi, beliefs as beliefApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useRoundStore } from '../store/roundStore';
import DreamCard from '../components/dreams/DreamCard';
import PostDreamModal from '../components/dreams/PostDreamModal';
import CountdownTimer from '../components/ui/CountdownTimer';

const FILTERS = [
  { key: 'top', label: '🔥 Top' },
  { key: 'rising', label: '📈 Rising' },
  { key: 'new', label: '🆕 New' },
  { key: 'fading', label: '⚠️ Fading' },
];

export default function Dreamboard() {
  const { user } = useAuthStore();
  const { currentRound, potSOL } = useRoundStore();
  const [filter, setFilter] = useState('top');
  const [dreamsList, setDreamsList] = useState([]);
  const [myBeliefs, setMyBeliefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDreams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dreamsApi.list({ filter });
      setDreamsList(data.dreams || []);
    } catch { } finally { setLoading(false); }
  }, [filter]);

  const fetchBeliefs = useCallback(async () => {
    if (!user) return;
    try {
      const data = await beliefApi.my();
      setMyBeliefs(data.beliefs || []);
    } catch { }
  }, [user]);

  useEffect(() => { fetchDreams(); }, [fetchDreams]);
  useEffect(() => { fetchBeliefs(); }, [fetchBeliefs]);

  return (
    <div className="page" style={{ background: 'var(--void)' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, var(--deep) 0%, var(--void) 100%)',
        padding: '40px 0 0',
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="section-label">Live</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800 }}>
                The Dreamboard
              </h1>
              <p style={{ color: 'var(--text-2)', marginTop: 6, fontSize: '0.9rem' }}>
                All active dreams competing in Round #{currentRound?.roundNumber || '—'}.
                {currentRound && <> Ends in <CountdownTimer endsAt={currentRound.endsAt} compact /></>}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {currentRound && (
                <div style={{
                  background: 'var(--gold-glow)', border: '1px solid rgba(255,209,102,0.3)',
                  borderRadius: 'var(--r-md)', padding: '8px 16px',
                  fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--gold)',
                }}>
                  ◎ {potSOL.toFixed(2)} pot
                </div>
              )}
              {user && (
                <button onClick={() => setModalOpen(true)} className="btn btn-primary">
                  + Post Dream
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '9px 18px', borderRadius: 'var(--r-md) var(--r-md) 0 0',
                  background: filter === f.key ? 'var(--surface)' : 'transparent',
                  color: filter === f.key ? 'var(--text)' : 'var(--text-3)',
                  border: `1px solid ${filter === f.key ? 'var(--border)' : 'transparent'}`,
                  borderBottom: filter === f.key ? '1px solid var(--surface)' : '1px solid transparent',
                  fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                  cursor: 'pointer', marginBottom: -1,
                }}
              >{f.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Beliefs bar */}
      {user && (
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-3)' }}>Your beliefs this round:</span>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: i < myBeliefs.length ? 'var(--gold)' : 'var(--border)',
                  boxShadow: i < myBeliefs.length ? '0 0 6px var(--gold)' : 'none',
                }} />
              ))}
              <span style={{ color: 'var(--text-2)' }}>{myBeliefs.length}/6 used</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="container" style={{ padding: '32px 24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--r-lg)' }} />
            ))}
          </div>
        ) : dreamsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-3)', marginBottom: 20 }}>
              No dreams here yet.
            </p>
            {user ? (
              <button onClick={() => setModalOpen(true)} className="btn btn-primary">
                Be the first to dream
              </button>
            ) : (
              <p style={{ color: 'var(--text-3)' }}>
                <a href="/signup" style={{ color: 'var(--gold)' }}>Join</a> to post your dream.
              </p>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 20, alignItems: 'start',
          }}>
            {dreamsList.map((dream, i) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                myBeliefs={myBeliefs}
                onBelief={fetchBeliefs}
                rank={filter === 'top' || filter === 'rising' ? i + 1 : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <PostDreamModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPosted={() => { fetchDreams(); setModalOpen(false); }}
      />
    </div>
  );
}
