import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dreams as dreamsApi } from '../services/api';
import { useRoundStore } from '../store/roundStore';
import { useAuthStore } from '../store/authStore';
import CountdownTimer from '../components/ui/CountdownTimer';
import DreamCard from '../components/dreams/DreamCard';
import PostDreamModal from '../components/dreams/PostDreamModal';

const TICKER_PHRASES = [
  'Someone just believed in a dream', 'A new dream was posted', 'The pot grows with every trade',
  'Sell your tokens, kill your dream publicly', '1 SOL. 1 Dream. 1 Shot.',
  'Everyone says they have a dream. Now prove it.', 'Post your dream. Win real funding.',
  'The 30% goes to believers of the winner', 'Round closes in less than an hour',
  'Dreams carry over. Winners retire forever.', 'Buy in. Believe. Win.',
];

export default function Home() {
  const { currentRound, potSOL } = useRoundStore();
  const { user } = useAuthStore();
  const [topDream, setTopDream] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dreamsApi.top().then(d => setTopDream(d.dreams?.[0] || null)).catch(() => {});
  }, []);

  const phrases = [...TICKER_PHRASES, ...TICKER_PHRASES];

  return (
    <div style={{ paddingTop: 0 }}>
      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(155,93,229,0.12) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(6,214,160,0.07) 0%, transparent 60%), var(--void)',
      }}>
        {/* Animated background grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: 0.15,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 120, paddingBottom: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            {/* Left: Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mint)', boxShadow: '0 0 12px var(--mint)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--mint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {currentRound ? `Round #${currentRound.roundNumber} · Live` : 'Built on Solana'}
                </span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', lineHeight: 1.08,
                letterSpacing: '-0.03em', color: 'var(--text)',
              }}>
                1 SOL.<br />
                <span style={{ color: 'var(--gold)' }}>1 Dream.</span><br />
                1 Shot.
              </h1>

              <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 420 }}>
                Post your real dream. Compete for community belief. Win{' '}
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>real SOL</span>{' '}
                from trading fees every 6 hours. The token is your passport. The dream is the product.
                Selling kills your dream — publicly.
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {user ? (
                  <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-lg">
                    🌟 Post Your Dream
                  </button>
                ) : (
                  <Link to="/signup" className="btn btn-primary btn-lg">
                    Join the Dream
                  </Link>
                )}
                <Link to="/arena" className="btn btn-ghost btn-lg">Watch the Arena →</Link>
              </div>

              {/* Round stats strip */}
              {currentRound && (
                <div style={{
                  display: 'flex', gap: 24, padding: '16px 20px',
                  background: 'var(--surface)', borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--border)', width: 'fit-content',
                }}>
                  <div>
                    <p className="section-label">Prize Pot</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold)' }}>
                      ◎ {potSOL.toFixed(2)}
                    </p>
                  </div>
                  <div style={{ width: 1, background: 'var(--border)' }} />
                  <div>
                    <p className="section-label">Round Ends</p>
                    <CountdownTimer endsAt={currentRound.endsAt} />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Top dream preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p className="section-label" style={{ textAlign: 'right' }}>Currently Leading</p>
              {topDream ? (
                <div style={{ animation: 'float-up 4s ease-in-out infinite' }}>
                  <DreamCard dream={topDream} rank={1} />
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <p style={{ color: 'var(--text-3)', fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
                    No dreams yet this round.<br />Be the first.
                  </p>
                </div>
              )}
              <Link to="/dreamboard" style={{
                textAlign: 'center', color: 'var(--text-3)', fontSize: '0.82rem',
                padding: '10px', display: 'block',
                borderRadius: 'var(--r-md)', border: '1px dashed var(--border)',
              }}>View all dreams →</Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', letterSpacing: '0.1em' }}>SCROLL</span>
            <div style={{ animation: 'float-up 1.5s ease-in-out infinite', color: 'var(--text-3)', fontSize: '0.9rem' }}>↓</div>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {phrases.map((p, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-dot" />
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <section style={{ padding: '96px 0', background: 'var(--deep)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="section-label" style={{ justifyContent: 'center', display: 'flex' }}>The Mechanism</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, marginTop: 8 }}>
              How it works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { step: '01', icon: '🎫', title: 'Hold the Token', desc: 'Must hold ≥ 1 SOL worth of the project token. No Phantom needed — paste your wallet address.' },
              { step: '02', icon: '🌟', title: 'Post Your Dream', desc: 'One dream per wallet. 20 word title. 280 character story. Pick a mood. Add proof if you have it.' },
              { step: '03', icon: '✨', title: 'Earn Beliefs', desc: 'Every holder gets 3 free Beliefs per 6-hour round. Back the dreams you think will win.' },
              { step: '04', icon: '💰', title: 'Win Real SOL', desc: '50% to the top dream. 10% each to 2nd and 3rd. 30% split among everyone who believed in the winner.' },
              { step: '05', icon: '💀', title: 'Sell = Die', desc: "Drop below the threshold and your dream turns grey. The whole platform sees you sold. It's public." },
              { step: '06', icon: '🏆', title: 'Win & Retire', desc: "Winning dreams are permanently retired to the Hall of Dreams. They can never compete again. Forever." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-3)', paddingTop: 3 }}>{step}</span>
                  <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700 }}>{title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prize split explainer ── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 700 }}>
              The Split
            </h2>
            <p style={{ color: 'var(--text-2)', marginTop: 12 }}>
              Every 6 hours, trading fees get redistributed. Dreamers fight for it. Believers bet on it.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { pct: '50%', label: '1st Place Dream', color: 'var(--gold)', icon: '🥇' },
              { pct: '10%', label: '2nd Place Dream', color: '#C0C0C0', icon: '🥈' },
              { pct: '10%', label: '3rd Place Dream', color: '#CD7F32', icon: '🥉' },
              { pct: '30%', label: 'Believers of #1', color: 'var(--mint)', icon: '✨' },
            ].map(({ pct, label, color, icon }) => (
              <div key={label} style={{
                padding: '28px 16px', background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color }}>{pct}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.4 }}>{label}</span>
              </div>
            ))}
          </div>

          <p style={{
            marginTop: 28, textAlign: 'center', color: 'var(--text-3)', fontSize: '0.82rem',
            padding: '14px 20px', background: 'var(--surface)', borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)',
          }}>
            The 30% to believers makes this a <strong style={{ color: 'var(--text)' }}>prediction game</strong>, not just voting.
            Back the right dream and you get paid alongside the dreamer.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,209,102,0.06) 0%, transparent 70%)',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, marginBottom: 16 }}>
          Everyone says they have a dream.<br />
          <span style={{ color: 'var(--gold)' }}>Now prove it.</span>
        </h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 36, maxWidth: 440, margin: '0 auto 36px' }}>
          Get the token. Post your dream. Fight for your funding. The pot fills every time someone trades.
        </p>
        <Link to="/signup" className="btn btn-primary btn-lg">Start with 1 SOL →</Link>
      </section>

      <PostDreamModal open={modalOpen} onClose={() => setModalOpen(false)} onPosted={() => {}} />
    </div>
  );
}
