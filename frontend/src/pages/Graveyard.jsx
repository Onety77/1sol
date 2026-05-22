import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dreams as dreamsApi } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const MOOD_EMOJI = { Serious:'🎯', Funny:'😂', Delusional:'🌀', Beautiful:'✨', Degenerate:'🔥', Impossible:'🚀', Unfinished:'⏳' };

function GraveCard({ dream }) {
  const isResurrected = dream.state === 'resurrected';
  const updatedAt = dream.updatedAt?.seconds
    ? new Date(dream.updatedAt.seconds * 1000)
    : dream.updatedAt?.toDate ? dream.updatedAt.toDate() : new Date();

  return (
    <div
      className={`dream-${dream.state}`}
      style={{
        borderRadius:'var(--r-lg)', padding:'20px',
        background: isResurrected ? 'rgba(28,12,50,0.9)' : 'rgba(8,8,20,0.9)',
        display:'flex', flexDirection:'column', gap:10,
        transition:'transform 0.2s',
        animation:'fade-in 0.4s ease-out',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = isResurrected ? 'translateY(-2px)' : ''; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
          {isResurrected ? (
            <span style={{ background:'var(--purple-glow)', color:'var(--purple)', border:'1px solid rgba(155,93,229,0.3)', borderRadius:'var(--r-sm)', padding:'2px 8px', fontSize:'0.7rem', fontWeight:700 }}>
              ⚡ Resurrected
            </span>
          ) : (
            <span style={{ background:'rgba(30,30,50,0.8)', color:'var(--text-3)', border:'1px solid #1A1A2E', borderRadius:'var(--r-sm)', padding:'2px 8px', fontSize:'0.7rem', fontWeight:700 }}>
              💀 Faded
            </span>
          )}
          {dream.mood && (
            <span className={`tag mood-${dream.mood}`} style={{ fontSize:'0.68rem', opacity: isResurrected ? 1 : 0.5 }}>
              {MOOD_EMOJI[dream.mood]} {dream.mood}
            </span>
          )}
        </div>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--text-3)' }}>
          {formatDistanceToNow(updatedAt, { addSuffix:true })}
        </span>
      </div>

      <h3 style={{
        fontFamily:'var(--font-display)', fontSize:'0.88rem', fontWeight:700, lineHeight:1.3,
        color: isResurrected ? 'var(--purple)' : 'var(--text-3)',
        filter: isResurrected ? 'none' : 'grayscale(100%)',
      }}>
        {dream.title}
      </h3>

      <p style={{
        fontSize:'0.8rem', lineHeight:1.5,
        color: isResurrected ? 'var(--text-2)' : '#3A3A5A',
        filter: isResurrected ? 'none' : 'grayscale(100%)',
      }}>
        {dream.story}
      </p>

      {!isResurrected && (
        <p style={{ fontSize:'0.72rem', color:'#2A2A4A', fontStyle:'italic', borderTop:'1px solid #111128', paddingTop:8 }}>
          This dream lost color because the dreamer sold.
        </p>
      )}
      {isResurrected && (
        <p style={{ fontSize:'0.72rem', color:'var(--purple)', borderTop:'1px solid rgba(155,93,229,0.2)', paddingTop:8 }}>
          The dreamer returned. Competing again next round.
        </p>
      )}

      <Link to={`/profile/${dream.walletAddress}`} style={{
        display:'flex', alignItems:'center', gap:6, color: isResurrected ? 'var(--text-3)' : '#2A2A4A',
        fontSize:'0.75rem', marginTop:'auto',
      }}>
        <div style={{
          width:16, height:16, borderRadius:'50%',
          background: isResurrected ? 'var(--purple)' : '#1E1E3A',
          opacity: isResurrected ? 1 : 0.4,
        }} />
        @{dream.username}
        <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', color: isResurrected ? 'var(--purple)' : '#2A2A4A' }}>
          ★ {dream.beliefCount || 0}
        </span>
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
    <div className="page" style={{
      minHeight:'100vh',
      background:`
        radial-gradient(ellipse 100% 60% at 50% 0%, rgba(15,5,30,0.8) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 20% 80%, rgba(0,0,0,0.5) 0%, transparent 60%),
        linear-gradient(180deg, #040411 0%, #060614 40%, #040411 100%)
      `,
    }}>
      {/* Atmospheric header */}
      <div style={{
        padding:'60px 0 40px', textAlign:'center', position:'relative',
        borderBottom:'1px solid #0C0C20',
      }}>
        {/* Fog effect */}
        <div style={{
          position:'absolute', inset:0, zIndex:0,
          background:'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(6,6,20,0.6) 0%, transparent 70%)',
          pointerEvents:'none',
        }} />
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:'3rem', marginBottom:12, filter:'grayscale(100%) brightness(0.6)' }}>🪦</div>
          <p className="section-label" style={{ justifyContent:'center', display:'flex', color:'#2A2A4A', marginBottom:8 }}>
            The Forgotten
          </p>
          <h1 style={{
            fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,3.5vw,2.8rem)',
            fontWeight:800, color:'#3A3A5A', letterSpacing:'-0.02em',
          }}>
            The Graveyard
          </h1>
          <p style={{ color:'#252540', marginTop:10, fontSize:'0.88rem', maxWidth:440, margin:'10px auto 0' }}>
            Dreams that lost color when their dreamers sold. Some found their way back.
            Most haven't.
          </p>

          <div style={{ marginTop:28, maxWidth:400, margin:'28px auto 0' }}>
            <input
              className="input"
              placeholder="Search faded dreams..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background:'rgba(12,12,30,0.8)', borderColor:'#131328', color:'#3A3A5A' }}
            />
          </div>

          <div style={{ display:'flex', gap:24, justifyContent:'center', marginTop:24, flexWrap:'wrap' }}>
            <span style={{ fontSize:'0.82rem', color:'#252540' }}>
              <span style={{ color:'#3A3A5A', fontWeight:600 }}>{faded.length}</span> faded
            </span>
            <span style={{ fontSize:'0.82rem', color:'var(--text-3)' }}>
              <span style={{ color:'var(--purple)', fontWeight:600 }}>{resurrected.length}</span> resurrected
            </span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop:40, paddingBottom:80 }}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {[...Array(8)].map((_,i) => <div key={i} className="skeleton" style={{ height:180, borderRadius:'var(--r-lg)', opacity:0.3 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <p style={{ color:'#252540', fontFamily:'var(--font-display)', fontSize:'1rem' }}>
              {search ? 'No matching faded dreams.' : 'The graveyard is empty. For now.'}
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
            {resurrected.length > 0 && (
              <div>
                <p style={{ fontFamily:'var(--font-display)', fontSize:'0.75rem', color:'var(--purple)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>
                  ⚡ They came back
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:14 }}>
                  {resurrected.map(d => <GraveCard key={d.id} dream={d} />)}
                </div>
              </div>
            )}
            {faded.length > 0 && (
              <div>
                <p style={{ fontFamily:'var(--font-display)', fontSize:'0.75rem', color:'#2A2A4A', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>
                  💀 Still grey
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:14 }}>
                  {faded.map(d => <GraveCard key={d.id} dream={d} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
