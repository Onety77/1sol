import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const [form, setForm] = useState({ username:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.username, form.password);
      navigate('/dreamboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page" style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(155,93,229,0.07) 0%, var(--void) 70%)',
    }}>
      <div style={{ width:'100%', maxWidth:420, padding:'0 20px' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{
            width:56, height:56, borderRadius:'50%', margin:'0 auto 16px',
            background:'linear-gradient(135deg, var(--gold), var(--coral))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.5rem', fontWeight:900, color:'var(--void)',
            fontFamily:'var(--font-display)',
          }}>1</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, letterSpacing:'-0.02em' }}>
            1 SOL AND A DREAM
          </h1>
          <p style={{ color:'var(--text-3)', marginTop:6, fontSize:'0.85rem' }}>
            Welcome back, dreamer.
          </p>
        </div>

        <div style={{
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:'var(--r-xl)', padding:'32px',
        }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label className="input-label">Username</label>
              <input
                className="input"
                placeholder="your_username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username:e.target.value }))}
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="input-label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password:e.target.value }))}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div style={{
                background:'var(--coral-glow)', border:'1px solid var(--coral)',
                borderRadius:'var(--r-md)', padding:'10px 14px',
                fontSize:'0.83rem', color:'var(--coral)',
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', marginTop:4 }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:'0.85rem', color:'var(--text-3)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color:'var(--gold)', fontWeight:600 }}>Join the dream</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
