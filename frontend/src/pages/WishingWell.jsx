import { useEffect, useState } from 'react';
import { useRoundStore } from '../store/roundStore';
import CountdownTimer from '../components/ui/CountdownTimer';

function StatPill({ label, value, color = 'var(--text)', mono = false }) {
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)',
      padding:'24px 28px', textAlign:'center', display:'flex', flexDirection:'column', gap:8,
    }}>
      <p className="section-label">{label}</p>
      <p style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)',
        fontSize:'clamp(1.6rem,3vw,2.4rem)', fontWeight:700, color, lineHeight:1,
      }}>{value}</p>
    </div>
  );
}

export default function WishingWell() {
  const { currentRound, potSOL, globalStats } = useRoundStore();
  const [rounds, setRounds] = useState([]);

  const stats = globalStats || {};

  const timeLeft = (() => {
    if (!currentRound?.endsAt) return null;
    const end = currentRound.endsAt?.toDate ? currentRound.endsAt.toDate() : currentRound.endsAt?.seconds ? new Date(currentRound.endsAt.seconds * 1000) : new Date(currentRound.endsAt);
    return end - Date.now();
  })();
  const pct = currentRound ? Math.max(0, Math.min(100, (1 - (timeLeft || 0) / (6 * 3600 * 1000)) * 100)) : 0;

  return (
    <div className="page" style={{
      background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,214,160,0.05) 0%, var(--void) 60%)',
    }}>
      {/* Header */}
      <div style={{ padding:'56px 0 48px', textAlign:'center' }}>
        <div className="container">
          <p className="section-label" style={{ justifyContent:'center', display:'flex', marginBottom:8 }}>Live Stats</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, letterSpacing:'-0.03em' }}>
            🌊 The Wishing Well
          </h1>
          <p style={{ color:'var(--text-2)', marginTop:10, fontSize:'0.95rem' }}>
            Every trade fills the well. Every round it empties into dreams.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom:80 }}>

        {/* Current pot — hero */}
        <div style={{
          background:'linear-gradient(135deg, rgba(6,40,28,0.95), rgba(4,15,30,0.95))',
          border:'1px solid rgba(6,214,160,0.3)', borderRadius:'var(--r-xl)',
          padding:'48px', textAlign:'center', marginBottom:32,
          boxShadow:'0 0 60px rgba(6,214,160,0.08)',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, var(--mint), transparent)' }} />

          <p className="section-label" style={{ justifyContent:'center', display:'flex', color:'var(--mint)', marginBottom:12 }}>
            Current Prize Pool
          </p>

          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:12 }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'clamp(3rem,8vw,6rem)', fontWeight:900, color:'var(--mint)', lineHeight:1 }}>
              {potSOL.toFixed(3)}
            </span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'1.5rem', color:'var(--mint)', opacity:0.7 }}>SOL</span>
          </div>

          <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', gap:32, marginTop:28 }}>
            <div>
              <p className="section-label">1st Place Gets</p>
              <p style={{ fontFamily:'var(--font-mono)', color:'var(--gold)', fontWeight:700, fontSize:'1.2rem' }}>
                ◎ {(potSOL * 0.5).toFixed(3)}
              </p>
            </div>
            <div>
              <p className="section-label">Believers Split</p>
              <p style={{ fontFamily:'var(--font-mono)', color:'var(--mint)', fontWeight:700, fontSize:'1.2rem' }}>
                ◎ {(potSOL * 0.3).toFixed(3)}
              </p>
            </div>
            <div>
              <p className="section-label">2nd + 3rd</p>
              <p style={{ fontFamily:'var(--font-mono)', color:'var(--text-2)', fontWeight:700, fontSize:'1.2rem' }}>
                ◎ {(potSOL * 0.2).toFixed(3)}
              </p>
            </div>
          </div>
        </div>

        {/* Round timer */}
        {currentRound && (
          <div style={{
            background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)',
            padding:'32px', marginBottom:32, display:'flex', alignItems:'center', gap:32, flexWrap:'wrap',
            justifyContent:'center',
          }}>
            <div style={{ textAlign:'center' }}>
              <p className="section-label" style={{ marginBottom:8 }}>Round #{currentRound.roundNumber} Closes In</p>
              <CountdownTimer endsAt={currentRound.endsAt} large="xl" />
            </div>

            {/* Progress bar */}
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'var(--text-3)', marginBottom:6 }}>
                <span>Round start</span>
                <span>{pct.toFixed(0)}% elapsed</span>
                <span>Round end</span>
              </div>
              <div style={{ height:8, background:'var(--elevated)', borderRadius:'var(--r-full)', overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:'var(--r-full)', transition:'width 1s linear',
                  width:`${pct}%`,
                  background: pct > 85 ? 'linear-gradient(90deg, var(--coral), #FF8C42)' : 'linear-gradient(90deg, var(--mint), var(--sky))',
                  boxShadow: pct > 85 ? '0 0 10px var(--coral)' : '0 0 10px var(--mint)',
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Global stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:32 }}>
          <StatPill label="Total SOL Distributed" value={`◎ ${(stats.totalSOLDistributed || 0).toFixed(2)}`} color="var(--gold)" mono />
          <StatPill label="Dreams Funded" value={stats.totalDreamsFunded || 0} color="var(--mint)" />
          <StatPill label="Beliefs Placed" value={(stats.totalBeliefsPlaced || 0).toLocaleString()} color="var(--text)" />
          <StatPill label="Rounds Completed" value={stats.totalRoundsCompleted || 0} color="var(--purple)" />
          <StatPill label="Total Dreams" value={stats.totalDreams || 0} color="var(--sky)" />
          <StatPill label="Total Dreamers" value={stats.totalUsers || 0} color="var(--text)" />
        </div>

        {/* How the pot works */}
        <div style={{
          background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)',
          padding:'32px',
        }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700, marginBottom:20 }}>
            How the pot fills
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { icon:'📊', text:'Creator fees accumulate from every token trade — buys, sells, and swaps.' },
              { icon:'🔥', text:'Boost purchases (Spotlight, Color Burst, Megaphone) burn tokens — they do NOT add to the pot. They reduce supply.' },
              { icon:'💰', text:'Extra Belief purchases also burn tokens. The pot and the burn are completely separate systems.' },
              { icon:'⚡', text:'At round close, the creator wallet balance minus gas reserve becomes the round prize pool.' },
              { icon:'🌊', text:'More volume = bigger pot = more funded dreams. The flywheel is real.' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <span style={{ fontSize:'1.2rem', flexShrink:0 }}>{icon}</span>
                <p style={{ fontSize:'0.85rem', color:'var(--text-2)', lineHeight:1.6 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
