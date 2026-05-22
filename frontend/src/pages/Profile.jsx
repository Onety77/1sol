import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { profile as profileApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';

const BADGE_META = {
  'day-one':     { icon:'🌅', label:'Day One Dreamer', desc:'Joined in the first week' },
  'funded':      { icon:'💰', label:'Funded Dream', desc:'Won a round' },
  'kingmaker':   { icon:'👑', label:'Kingmaker', desc:'Believed in a winning dream' },
  'never-sold':  { icon:'🔒', label:'Never Sold', desc:'30 consecutive days above threshold' },
  'true-believer':{ icon:'⭐', label:'True Believer', desc:'Backed 20+ winning dreams' },
  'faded':       { icon:'💀', label:'Faded', desc:'Dropped below threshold once' },
  'resurrected': { icon:'⚡', label:'Resurrected', desc:'Came back after fading' },
  'fulfilled':   { icon:'🌱', label:'Dream Fulfilled', desc:'Posted proof after winning' },
  'all-in':      { icon:'🎲', label:'All In', desc:'Used all 6 beliefs in one round' },
  'unbroken':    { icon:'🔥', label:'Unbroken', desc:'100-day streak' },
};

const STATE_COLORS = { alive:'var(--mint)', fading:'var(--coral)', grey:'var(--text-3)', resurrected:'var(--purple)', crowned:'var(--gold)' };
const STATE_ICONS = { alive:'●', fading:'⚠️', grey:'💀', resurrected:'⚡', crowned:'👑' };

export default function Profile() {
  const { wallet } = useParams();
  const { user: me } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName:'', profilePicUrl:'' });
  const [saving, setSaving] = useState(false);

  const isMe = me?.walletAddress === wallet;

  useEffect(() => {
    profileApi.get(wallet)
      .then(d => { setProfile(d); setEditForm({ displayName: d.displayName || '', profilePicUrl: d.profilePicUrl || '' }); setLoading(false); })
      .catch(() => { setError('Profile not found.'); setLoading(false); });
  }, [wallet]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.update(editForm);
      setProfile(p => ({ ...p, ...editForm }));
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="page" style={{ display:'flex', justifyContent:'center', paddingTop:120 }}>
      <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid var(--border)', borderTopColor:'var(--gold)', animation:'spin 0.8s linear infinite' }} />
    </div>
  );

  if (error || !profile) return (
    <div className="page" style={{ textAlign:'center', paddingTop:120 }}>
      <p style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--text-3)' }}>{error || 'Profile not found.'}</p>
    </div>
  );

  const holderColor = profile.holderStatus === 'active' ? 'var(--mint)' : profile.holderStatus === 'resurrected' ? 'var(--purple)' : 'var(--text-3)';
  const activeDream = profile.dreams?.find(d => !d.isRetired && d.state !== 'grey');

  return (
    <div className="page" style={{ background:'var(--void)' }}>
      <div className="container" style={{ paddingTop:40, paddingBottom:80, maxWidth:900 }}>

        {/* Profile header */}
        <div style={{
          background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)',
          padding:'32px', marginBottom:24,
          display:'grid', gridTemplateColumns:'auto 1fr', gap:28, alignItems:'start',
        }}>
          {/* Avatar */}
          <div style={{ position:'relative' }}>
            {profile.profilePicUrl ? (
              <img src={profile.profilePicUrl} alt="" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--border)' }} onError={e => { e.target.style.display='none'; }} />
            ) : (
              <div style={{
                width:80, height:80, borderRadius:'50%',
                background:`linear-gradient(135deg, hsl(${wallet?.charCodeAt(0)*7%360},70%,50%), hsl(${wallet?.charCodeAt(2)*11%360},70%,40%))`,
                flexShrink:0,
              }} />
            )}
            <div style={{
              position:'absolute', bottom:2, right:2, width:14, height:14, borderRadius:'50%',
              background: holderColor, border:'2px solid var(--surface)',
              boxShadow:`0 0 6px ${holderColor}`,
            }} />
          </div>

          {/* Info */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
              <div>
                {editing ? (
                  <input className="input" value={editForm.displayName} onChange={e => setEditForm(f => ({ ...f, displayName:e.target.value }))}
                    placeholder="Display name" style={{ marginBottom:8 }} />
                ) : (
                  <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:700, marginBottom:4 }}>
                    {profile.displayName || profile.username}
                  </h1>
                )}
                <p style={{ color:'var(--text-3)', fontSize:'0.83rem' }}>@{profile.username}</p>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--text-3)', marginTop:4 }}>
                  {profile.walletShort}
                </p>
              </div>

              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{
                  padding:'4px 12px', borderRadius:'var(--r-xl)',
                  background: profile.holderStatus === 'active' ? 'var(--mint-glow)' : profile.holderStatus === 'resurrected' ? 'var(--purple-glow)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${holderColor}`, color: holderColor,
                  fontSize:'0.75rem', fontWeight:700,
                }}>
                  {profile.holderStatus === 'active' ? '● Active' : profile.holderStatus === 'resurrected' ? '⚡ Resurrected' : '💀 Faded'}
                </div>
                {isMe && !editing && (
                  <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm">Edit</button>
                )}
                {isMe && editing && (
                  <>
                    <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">{saving ? '...' : 'Save'}</button>
                    <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm">Cancel</button>
                  </>
                )}
              </div>
            </div>

            {editing && (
              <input className="input" value={editForm.profilePicUrl} onChange={e => setEditForm(f => ({ ...f, profilePicUrl:e.target.value }))}
                placeholder="Profile picture URL (https://...)" />
            )}

            {/* Stats row */}
            <div style={{ display:'flex', gap:20, flexWrap:'wrap', paddingTop:8, borderTop:'1px solid var(--border)' }}>
              {[
                { label:'Streak', value:`🔥 ${profile.neverSoldStreak || 0}d` },
                { label:'Rounds', value:profile.roundsParticipated || 0 },
                { label:'Wins', value:profile.roundsWon || 0 },
                { label:'Beliefs Given', value:profile.totalBeliefsGiven || 0 },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="section-label">{label}</p>
                  <p style={{ fontWeight:600, color:'var(--text)', fontFamily:'var(--font-mono)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active dream */}
        {activeDream && (
          <div style={{ marginBottom:24 }}>
            <p className="section-label" style={{ marginBottom:12 }}>Active Dream</p>
            <div style={{
              background:'var(--surface)', border:`1px solid ${STATE_COLORS[activeDream.state] || 'var(--border)'}`,
              borderRadius:'var(--r-lg)', padding:'20px',
              boxShadow: activeDream.state === 'alive' ? '0 0 16px var(--mint-glow)' : 'none',
            }}>
              <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                <span style={{ color:STATE_COLORS[activeDream.state], fontSize:'0.8rem', fontWeight:600 }}>
                  {STATE_ICONS[activeDream.state]} {activeDream.state}
                </span>
              </div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700, marginBottom:8 }}>{activeDream.title}</h3>
              <p style={{ fontSize:'0.83rem', color:'var(--text-2)' }}>{activeDream.story}</p>
              <p style={{ fontFamily:'var(--font-mono)', color:'var(--gold)', marginTop:10, fontSize:'0.85rem' }}>★ {activeDream.beliefCount || 0} beliefs</p>
            </div>
          </div>
        )}

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <p className="section-label" style={{ marginBottom:12 }}>Badges</p>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {profile.badges.map(badge => {
                const meta = BADGE_META[badge] || { icon:'🏅', label:badge, desc:'' };
                return (
                  <div key={badge} title={meta.desc} style={{
                    background:'var(--surface)', border:'1px solid var(--border)',
                    borderRadius:'var(--r-md)', padding:'8px 14px',
                    display:'flex', alignItems:'center', gap:8, fontSize:'0.82rem',
                    cursor:'help',
                  }}>
                    <span>{meta.icon}</span>
                    <span style={{ color:'var(--text-2)' }}>{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dream history */}
        {profile.dreams?.length > 0 && (
          <div>
            <p className="section-label" style={{ marginBottom:12 }}>Dream History</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {profile.dreams.map(d => {
                const createdAt = d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000) : new Date();
                return (
                  <div key={d.id} style={{
                    background:'var(--surface)', border:'1px solid var(--border)',
                    borderRadius:'var(--r-md)', padding:'16px',
                    opacity: d.state === 'grey' ? 0.6 : 1,
                    display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12,
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                        <span style={{ color: d.isRetired && d.state === 'crowned' ? 'var(--gold)' : STATE_COLORS[d.state] || 'var(--text-3)', fontSize:'0.75rem', fontWeight:600 }}>
                          {d.isRetired && d.state === 'crowned' ? '👑 Crowned' : `${STATE_ICONS[d.state] || '●'} ${d.state}`}
                        </span>
                      </div>
                      <p style={{ fontFamily:'var(--font-display)', fontSize:'0.85rem', fontWeight:600 }}>{d.title}</p>
                      <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:4 }}>
                        {formatDistanceToNow(createdAt, { addSuffix:true })}
                      </p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.85rem' }}>★ {d.beliefCount || 0}</p>
                      {d.winningRound && (
                        <p style={{ fontSize:'0.72rem', color:'var(--gold)', marginTop:4 }}>Won ◎</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
