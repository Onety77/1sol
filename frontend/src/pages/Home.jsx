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
  'Sell your tokens, lose your dream — publicly', '1 SOL. 1 Dream. 1 Shot.',
  'Everyone says they have a dream. Now prove it.', 'Post your dream. Win real funding.',
  'The 30% goes to believers of the winner', 'Buy in. Believe. Win.',
  'Dreams carry over. Winners retire forever.', 'Round closes in less than an hour',
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🎫', title: 'Hold the Token', desc: 'Must hold ≥ 1 SOL worth of the project token. No Phantom needed — paste your wallet address.' },
  { step: '02', icon: '🌟', title: 'Post Your Dream', desc: 'One dream per wallet. 20 word title. 280 character story. Pick a mood. Add proof if you have it.' },
  { step: '03', icon: '✨', title: 'Earn Beliefs', desc: 'Every holder gets 3 free Beliefs per 6-hour round. Back the dreams you think will win.' },
  { step: '04', icon: '💰', title: 'Win Real SOL', desc: '50% to the top dream. 10% each to 2nd and 3rd. 30% split among everyone who believed in the winner.' },
  { step: '05', icon: '💀', title: 'Sell = Die', desc: 'Drop below the threshold and your dream turns grey. The whole platform sees you sold. It\'s public.' },
  { step: '06', icon: '👑', title: 'Win & Retire', desc: 'Winning dreams are permanently retired to the Hall of Dreams. They can never compete again. Forever.' },
];

const SPLIT = [
  { pct: '50%', label: '1st Place Dream', color: 'var(--gold)', shadow: 'rgba(251,191,36,0.3)' },
  { pct: '10%', label: '2nd Place Dream', color: '#C0C0D0', shadow: 'rgba(192,192,208,0.2)' },
  { pct: '10%', label: '3rd Place Dream', color: '#CD7F32', shadow: 'rgba(205,127,50,0.2)' },
  { pct: '30%', label: 'Believers of #1', color: 'var(--alive)', shadow: 'rgba(34,211,238,0.2)' },
];

export default function Home() {
  const { currentRound, potSOL } = useRoundStore();
  const { user } = useAuthStore();
  const [topDream, setTopDream] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const phrases = [...TICKER_PHRASES, ...TICKER_PHRASES];

  useEffect(() => {
    dreamsApi.top().then(d => setTopDream(d.dreams?.[0] || null)).catch(() => {});
  }, []);

  return (
    <div style={{ paddingTop: 0 }}>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Radial spotlight on canvas */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 70% at 30% 45%, rgba(167,139,250,0.06) 0%, transparent 65%), radial-gradient(ellipse 50% 50% at 70% 55%, rgba(34,211,238,0.04) 0%, transparent 60%)',
        }} />

        <div className="container" style={{
          position: 'relative', zIndex: 1,
          paddingTop: 120, paddingBottom: 80,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
            gap: 64, alignItems: 'center',
          }}>

            {/* Left: Copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* Live badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--alive)',
                  boxShadow: '0 0 0 3px rgba(34,211,238,0.2)',
                  animation: 'glow-pulse 2s ease-in-out infinite',
                }} />
                <span style={{
                  fontSize: '0.72rem', color: 'var(--alive)',
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  {currentRound ? `Round #${currentRound.roundNumber} · Live` : 'Built on Solana'}
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 'clamp(2.6rem, 5vw, 4.5rem)', lineHeight: 1.04,
                letterSpacing: '-0.035em',
              }}>
                1 SOL.<br />
                <span className="shimmer-gold">1 Dream.</span><br />
                1 Shot.
              </h1>

              <p style={{
                fontSize: 'clamp(0.95rem, 1.5vw, 1.08rem)',
                color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 440,
              }}>
                Post your real dream. Compete for community belief. Win{' '}
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>real SOL</span>{' '}
                from trading fees every 6 hours. The token is your passport. The dream is the product.{' '}
                <span style={{ color: 'var(--fading)' }}>Selling kills your dream — publicly.</span>
              </p>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {user ? (
                  <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-lg">
                    Post Your Dream
                  </button>
                ) : (
                  <Link to="/signup" className="btn btn-primary btn-lg">
                    Join the Dream
                  </Link>
                )}
                <Link to="/arena" className="btn btn-ghost btn-lg">
                  Watch the Arena →
                </Link>
              </div>

              {/* Round stats glass pill */}
              {currentRound && (
                <div style={{
                  display: 'flex', gap: 0, width: 'fit-content',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--r-xl)',
                  backdropFilter: 'blur(20px)',
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '16px 24px' }}>
                    <p className="section-label" style={{ marginBottom: 4 }}>Prize Pot</p>
                    <p style={{
                      fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700,
                      color: 'var(--gold)',
                      textShadow: '0 0 20px rgba(251,191,36,0.4)',
                    }}>◎ {potSOL.toFixed(2)}</p>
                  </div>
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.07)' }} />
                  <div style={{ padding: '16px 24px' }}>
                    <p className="section-label" style={{ marginBottom: 4 }}>Closes In</p>
                    <CountdownTimer endsAt={currentRound.endsAt} />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Top dream floating card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p className="section-label" style={{ textAlign: 'right' }}>Currently Leading</p>
              {topDream ? (
                <div style={{ animation: 'float-subtle 6s ease-in-out infinite' }}>
                  <DreamCard dream={topDream} rank={1} />
                </div>
              ) : (
                <div className="glass" style={{
                  textAlign: 'center', padding: '56px 32px',
                  borderRadius: 'var(--r-lg)',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontSize: '0.9rem',
                    color: 'var(--text-3)', lineHeight: 1.6,
                  }}>No dreams yet this round.<br />Be the first.</p>
                </div>
              )}
              <Link to="/dreamboard" style={{
                textAlign: 'center', color: 'var(--text-3)', fontSize: '0.8rem',
                padding: '10px', display: 'block',
                borderRadius: 'var(--r-md)',
                border: '1px dashed rgba(255,255,255,0.08)',
                transition: 'color 0.2s, border-color 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >View all dreams →</Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%',
          transform: 'translateX(-50%)', zIndex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          opacity: 0.4,
        }}>
          <span style={{ fontSize: '0.58rem', letterSpacing: '0.2em', fontFamily: 'var(--font-mono)' }}>SCROLL</span>
          <div style={{ animation: 'float 2s ease-in-out infinite', fontSize: '0.8rem' }}>↓</div>
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
      <section style={{
        padding: 'clamp(64px, 8vw, 96px) 0',
        background: 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(167,139,250,0.04) 0%, transparent 70%)',
        position: 'relative',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p className="section-label" style={{ justifyContent: 'center', display: 'flex', marginBottom: 10 }}>
              The Mechanism
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700,
              letterSpacing: '-0.03em',
            }}>How it works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {HOW_IT_WORKS.map(({ step, icon, title, desc }, i) => (
              <div
                key={step}
                className="glass"
                style={{
                  padding: '24px', display: 'flex', flexDirection: 'column', gap: 12,
                  animation: `fade-in 0.5s ease-out ${i * 0.07}s both`,
                  transition: 'transform 0.25s, box-shadow 0.25s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                    color: 'var(--text-3)', paddingTop: 4,
                    letterSpacing: '0.05em',
                  }}>{step}</span>
                  <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.82rem',
                  fontWeight: 700, letterSpacing: '-0.01em',
                }}>{title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prize split ── */}
      <section style={{ padding: 'clamp(64px, 8vw, 80px) 0' }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 700,
              letterSpacing: '-0.025em',
            }}>The Split</h2>
            <p style={{ color: 'var(--text-2)', marginTop: 10, fontSize: '0.9rem' }}>
              Every 6 hours, trading fees get redistributed. Dreamers fight for it. Believers bet on it.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {SPLIT.map(({ pct, label, color, shadow }, i) => (
              <div
                key={label}
                className="glass"
                style={{
                  padding: 'clamp(16px, 3vw, 28px) 12px',
                  textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8,
                  animation: `fade-in 0.5s ease-out ${i * 0.1}s both`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 0 40px ${shadow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color,
                  textShadow: `0 0 24px ${shadow}`,
                  lineHeight: 1,
                }}>{pct}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-2)', lineHeight: 1.4 }}>{label}</span>
              </div>
            ))}
          </div>

          <p style={{
            marginTop: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: '0.82rem',
            padding: '14px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 'var(--r-md)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            The 30% to believers makes this a{' '}
            <strong style={{ color: 'var(--text)' }}>prediction game</strong>, not just voting.
            Back the right dream and you get paid alongside the dreamer.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: 'clamp(80px, 10vw, 120px) 24px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(251,191,36,0.05) 0%, transparent 70%)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle gold corona */}
        <div style={{
          position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)',
          width: 400, height: 120,
          background: 'radial-gradient(ellipse, rgba(251,191,36,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900,
          marginBottom: 16, letterSpacing: '-0.03em',
          lineHeight: 1.15,
        }}>
          Everyone says they have a dream.<br />
          <span className="shimmer-gold">Now prove it.</span>
        </h2>
        <p style={{
          color: 'var(--text-2)', marginBottom: 36,
          maxWidth: 420, margin: '0 auto 36px',
          lineHeight: 1.7,
        }}>
          Get the token. Post your dream. Fight for your funding. The pot fills every time someone trades.
        </p>
        <Link to="/signup" className="btn btn-primary btn-lg">
          Start with 1 SOL →
        </Link>
      </section>

      <PostDreamModal open={modalOpen} onClose={() => setModalOpen(false)} onPosted={() => {}} />
    </div>
  );
}
