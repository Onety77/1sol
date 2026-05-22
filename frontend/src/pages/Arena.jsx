import { useEffect, useState } from 'react';
import { dreams as dreamsApi, beliefs as beliefApi } from '../services/api';
import { useRoundStore } from '../store/roundStore';
import { useAuthStore } from '../store/authStore';
import CountdownTimer from '../components/ui/CountdownTimer';
import DreamCard from '../components/dreams/DreamCard';

const MOOD_EMOJI = { Serious:'🎯', Funny:'😂', Delusional:'🌀', Beautiful:'✨', Degenerate:'🔥', Impossible:'🚀', Unfinished:'⏳' };

function BigDreamHero({ dream, myBeliefs, onBelief }) {
  const { user } = useAuthStore();
  const [believed, setBelieved] = useState(myBeliefs.includes(dream.id));
  const [count, setCount] = useState(dream.beliefCount || 0);
  const [loading, setLoading] = useState(false);

  const canBelieve = user && user.userId !== dream.userId && !believed && dream.state !== 'grey';

  const handleBelieve = async () => {
    if (!canBelieve || loading) return;
    setLoading(true);
    try {
      await beliefApi.place(dream.id);
      setBelieved(true); setCount(c => c + 1); onBelief?.();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      position: 'relative', borderRadius: 'var(--r-xl)',
      background: 'linear-gradient(135deg, rgba(26,18,4,0.98), rgba(18,12,36,0.98))',
      border: '1px solid var(--gold)', padding: '40px',
      boxShadow: '0 0 60px rgba(255,209,102,0.15), 0 0 120px rgba(255,209,102,0.05)',
      animation: 'crown-glow 3s ease-in-out infinite',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{
            background:'var(--gold)', color:'var(--void)', fontFamily:'var(--font-display)',
            fontWeight:900, fontSize:'0.85rem', padding:'4px 12px', borderRadius:'var(--r-sm)',
          }}>👑 #1 DREAM</div>
          <span className={`tag mood-${dream.mood}`}>{MOOD_EMOJI[dream.mood]} {dream.mood}</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {dream.proofImageUrl && <span>📸</span>}
          {dream.proofLink && <span>🔗</span>}
        </div>
      </div>

      <h2 style={{
        fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(1.4rem,3vw,2rem)',
        lineHeight:1.2, color:'var(--gold)', marginBottom:16, letterSpacing:'-0.02em',
      }}>{dream.title}</h2>

      <p style={{ fontSize:'1rem', color:'var(--text-2)', lineHeight:1.7, maxWidth:600, marginBottom:28 }}>
        {dream.story}
      </p>

      {dream.proofImageUrl && (
        <img src={dream.proofImageUrl} alt="proof"
          style={{ maxHeight:160, borderRadius:'var(--r-md)', marginBottom:20, objectFit:'cover' }}
          onError={e => e.target.style.display='none'} />
      )}

      <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg, hsl(${dream.walletAddress?.charCodeAt(0)*7%360},70%,50%), hsl(${dream.walletAddress?.charCodeAt(2)*11%360},70%,40%))` }} />
          <span style={{ color:'var(--text-2)', fontSize:'0.9rem' }}>@{dream.username}</span>
        </div>

        <div style={{ display:'flex', gap:8, alignItems:'center', marginLeft:'auto' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'1.1rem', color:'var(--gold)', fontWeight:700 }}>
            ★ {count}
          </span>
          <span style={{ color:'var(--text-3)', fontSize:'0.8rem' }}>beliefs</span>

          {canBelieve && (
            <button onClick={handleBelieve} disabled={loading} className="btn btn-primary">
              {loading ? '...' : 'Believe in This Dream'}
            </button>
          )}
          {believed && <span style={{ color:'var(--gold)', fontWeight:600 }}>✓ You believed</span>}
          {!user && <span style={{ color:'var(--text-3)', fontSize:'0.82rem' }}>Join to believe</span>}
        </div>
      </div>
    </div>
  );
}

export default function Arena() {
  const { currentRound, potSOL } = useRoundStore();
  const [topDreams, setTopDreams] = useState([]);
  const [myBeliefs, setMyBeliefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const timeLeft = (() => {
    if (!currentRound?.endsAt) return null;
    const end = currentRound.endsAt?.toDate ? currentRound.endsAt.toDate() : currentRound.endsAt?.seconds ? new Date(currentRound.endsAt.seconds * 1000) : new Date(currentRound.endsAt);
    return end - Date.now();
  })();
  const isFinalHour = timeLeft !== null && timeLeft < 3600000 && timeLeft > 0;

  useEffect(() => {
    dreamsApi.top().then(d => { setTopDreams(d.dreams || []); setLoading(false); }).catch(() => setLoading(false));
    if (user) beliefApi.my().then(d => setMyBeliefs(d.beliefs || [])).catch(() => {});
  }, [user]);

  return (
    <div className="page" style={{
      background: isFinalHour
        ? 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(239,71,111,0.08) 0%, var(--void) 60%)'
        : 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,209,102,0.05) 0%, var(--void) 60%)',
    }}>
      {/* Arena header */}
      <div style={{ padding:'48px 0 32px', textAlign:'center', position:'relative' }}>
        <div className="container">
          {isFinalHour && (
            <div style={{
              display:'inline-block', marginBottom:16, padding:'6px 18px',
              background:'var(--coral-glow)', border:'1px solid var(--coral)',
              borderRadius:'var(--r-xl)', fontSize:'0.8rem', color:'var(--coral)',
              fontWeight:600, letterSpacing:'0.05em', animation:'fading-pulse 1.5s ease-in-out infinite',
            }}>
              ⚡ FINAL HOUR — Beliefs locking soon
            </div>
          )}

          <p className="section-label" style={{ justifyContent:'center', display:'flex' }}>Round #{currentRound?.roundNumber || '—'}</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, marginTop:8, letterSpacing:'-0.03em' }}>
            The Arena
          </h1>
          <p style={{ color:'var(--text-2)', marginTop:10, fontSize:'0.95rem' }}>
            Top 10 dreams competing right now. The round ends in:
          </p>

          {currentRound && (
            <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:20 }}>
              <CountdownTimer endsAt={currentRound.endsAt} large />
            </div>
          )}

          <div style={{
            display:'flex', justifyContent:'center', gap:32, marginTop:28, flexWrap:'wrap',
          }}>
            <div style={{ textAlign:'center' }}>
              <p className="section-label">Prize Pool</p>
              <p style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:700, color:'var(--gold)' }}>
                ◎ {potSOL.toFixed(2)}
              </p>
            </div>
            <div style={{ textAlign:'center' }}>
              <p className="section-label">Dreams Fighting</p>
              <p style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:700 }}>
                {topDreams.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom:80 }}>
        {loading ? (
          <div style={{ display:'grid', gap:20 }}>
            {[...Array(3)].map((_,i) => <div key={i} className="skeleton" style={{ height:200, borderRadius:'var(--r-xl)' }} />)}
          </div>
        ) : topDreams.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'var(--text-3)' }}>
              The arena is empty.<br />No dreams yet this round.
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            {/* #1 — Hero treatment */}
            {topDreams[0] && (
              <BigDreamHero
                dream={topDreams[0]}
                myBeliefs={myBeliefs}
                onBelief={() => beliefApi.my().then(d => setMyBeliefs(d.beliefs || [])).catch(() => {})}
              />
            )}

            {/* #2 and #3 — Side by side */}
            {topDreams.slice(1, 3).length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))', gap:20 }}>
                {topDreams.slice(1, 3).map((d, i) => (
                  <DreamCard key={d.id} dream={d} myBeliefs={myBeliefs} onBelief={() => beliefApi.my().then(dt => setMyBeliefs(dt.beliefs||[])).catch(()=>{})} rank={i+2} />
                ))}
              </div>
            )}

            {/* #4–#10 — compact grid */}
            {topDreams.slice(3).length > 0 && (
              <>
                <div style={{ borderTop:'1px solid var(--border)', paddingTop:24 }}>
                  <p className="section-label" style={{ marginBottom:16 }}>The Rest of the Field</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:16 }}>
                    {topDreams.slice(3).map((d, i) => (
                      <DreamCard key={d.id} dream={d} myBeliefs={myBeliefs} onBelief={() => {}} rank={i+4} compact />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
