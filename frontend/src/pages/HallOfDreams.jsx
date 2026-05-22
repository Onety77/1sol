import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dreams as dreamsApi } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const MOOD_EMOJI = { Serious:'🎯', Funny:'😂', Delusional:'🌀', Beautiful:'✨', Degenerate:'🔥', Impossible:'🚀', Unfinished:'⏳' };
const PLACE_LABELS = { 1:'🥇 Champion', 2:'🥈 Runner-Up', 3:'🥉 Third Place' };

function WinnerCard({ winner }) {
  const wonAt = winner.wonAt?.seconds
    ? new Date(winner.wonAt.seconds * 1000)
    : winner.wonAt?.toDate ? winner.wonAt.toDate() : new Date(winner.wonAt || Date.now());

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(26,18,4,0.95), rgba(18,12,36,0.95))',
      border: `1px solid ${winner.place === 1 ? 'var(--gold)' : winner.place === 2 ? '#9090A0' : '#7B5B2B'}`,
      borderRadius: 'var(--r-xl)', padding: '28px',
      boxShadow: winner.place === 1 ? '0 0 40px rgba(255,209,102,0.12)' : 'none',
      display: 'flex', flexDirection: 'column', gap: 14,
      animation: 'fade-in 0.4s ease-out',
      position: 'relative', overflow: 'hidden',
    }}>
      {winner.place === 1 && (
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <span style={{
            background: winner.place===1 ? 'var(--gold-glow)' : 'rgba(255,255,255,0.05)',
            color: winner.place===1 ? 'var(--gold)' : 'var(--text-2)',
            border: `1px solid ${winner.place===1 ? 'rgba(255,209,102,0.4)' : 'var(--border)'}`,
            borderRadius: 'var(--r-sm)', padding:'3px 10px', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.05em',
          }}>
            {PLACE_LABELS[winner.place] || `#${winner.place}`}
          </span>
          {winner.mood && (
            <span className={`tag mood-${winner.mood}`} style={{ fontSize:'0.7rem' }}>
              {MOOD_EMOJI[winner.mood]} {winner.mood}
            </span>
          )}
        </div>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--text-3)' }}>
          Round #{winner.roundNumber}
        </span>
      </div>

      <h3 style={{
        fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700,
        color: winner.place===1 ? 'var(--gold)' : 'var(--text)', lineHeight:1.3,
      }}>
        {winner.title}
      </h3>

      <p style={{ fontSize:'0.83rem', color:'var(--text-2)', lineHeight:1.55 }}>
        {winner.story}
      </p>

      {winner.fulfillmentProof && (
        <a href={winner.fulfillmentProof} target="_blank" rel="noopener noreferrer"
          style={{ fontSize:'0.78rem', color:'var(--mint)', display:'flex', alignItems:'center', gap:4 }}>
          🌱 Fulfillment proof posted
        </a>
      )}

      <div style={{ borderTop:'1px solid var(--border)', paddingTop:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Link to={`/profile/${winner.walletAddress}`} style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-2)', fontSize:'0.82rem' }}>
          <div style={{
            width:24, height:24, borderRadius:'50%',
            background:`linear-gradient(135deg, hsl(${winner.walletAddress?.charCodeAt(0)*7%360},70%,50%), hsl(${winner.walletAddress?.charCodeAt(2)*11%360},70%,40%))`,
          }} />
          @{winner.username}
        </Link>

        <div style={{ display:'flex', gap:16, alignItems:'center' }}>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontFamily:'var(--font-mono)', color:'var(--gold)', fontWeight:700, fontSize:'1rem' }}>
              ◎ {(winner.solWon || 0).toFixed(3)}
            </p>
            <p style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>SOL won</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'1rem', fontWeight:700 }}>
              ★ {winner.beliefCount || 0}
            </p>
            <p style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>believers</p>
          </div>
        </div>
      </div>

      <p style={{ fontSize:'0.72rem', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>
        {formatDistanceToNow(wonAt, { addSuffix: true })}
      </p>
    </div>
  );
}

export default function HallOfDreams() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dreamsApi.hall().then(d => { setWinners(d.winners || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const champions = winners.filter(w => w.place === 1);
  const others = winners.filter(w => w.place !== 1);

  return (
    <div className="page" style={{
      background:'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,209,102,0.07) 0%, var(--void) 60%)',
    }}>
      {/* Header */}
      <div style={{ padding:'48px 0 48px', textAlign:'center' }}>
        <div className="container">
          <p className="section-label" style={{ justifyContent:'center', display:'flex', marginBottom:8 }}>
            Permanent Archive
          </p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:900, letterSpacing:'-0.03em' }}>
            ✦ Hall of Dreams
          </h1>
          <p style={{ color:'var(--text-2)', marginTop:12, fontSize:'0.95rem', maxWidth:500, margin:'12px auto 0' }}>
            Funded dreams live here forever. Winning retires your dream permanently — it can never compete again.
            This is the highest honor.
          </p>
          {winners.length > 0 && (
            <div style={{ display:'flex', gap:32, justifyContent:'center', marginTop:32, flexWrap:'wrap' }}>
              {[
                { label:'Dreams Funded', value:champions.length },
                { label:'Total Rounds', value:winners.length > 0 ? Math.max(...winners.map(w => w.roundNumber || 0)) : 0 },
                { label:'Total SOL Paid', value:`◎ ${winners.reduce((s,w) => s + (w.solWon||0), 0).toFixed(2)}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign:'center' }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:700, color:'var(--gold)' }}>{value}</p>
                  <p className="section-label" style={{ marginTop:4 }}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingBottom:80 }}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {[...Array(6)].map((_,i) => <div key={i} className="skeleton" style={{ height:280, borderRadius:'var(--r-xl)' }} />)}
          </div>
        ) : winners.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:'4rem', marginBottom:16 }}>🏛️</div>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--text-3)', marginBottom:8 }}>
              The hall awaits its first legend.
            </p>
            <p style={{ color:'var(--text-3)', fontSize:'0.85rem' }}>
              No dreams have been funded yet. The first round hasn't closed.
            </p>
          </div>
        ) : (
          <>
            {champions.length > 0 && (
              <div style={{ marginBottom:48 }}>
                <p className="section-label" style={{ marginBottom:20 }}>Champions</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:24 }}>
                  {champions.map(w => <WinnerCard key={w.id} winner={w} />)}
                </div>
              </div>
            )}
            {others.length > 0 && (
              <div>
                <p className="section-label" style={{ marginBottom:20 }}>Runners-Up</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
                  {others.map(w => <WinnerCard key={w.id} winner={w} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
