import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { wallet as walletApi } from '../services/api';

const STEPS = ['Account', 'Wallet', 'Verify'];

export default function Signup() {
  const navigate = useNavigate();
  const signup = useAuthStore(s => s.signup);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ username:'', password:'', confirmPassword:'', walletAddress:'' });
  const [walletStatus, setWalletStatus] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyWallet = async () => {
    if (!form.walletAddress) return;
    setVerifying(true); setError(''); setWalletStatus(null);
    try {
      const result = await walletApi.verify(form.walletAddress);
      setWalletStatus(result);
      if (result.qualified) setStep(2);
      else setError(`Need ≥ 1 SOL worth of tokens. Current value: ${result.solValue?.toFixed(4) || '0'} SOL`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify wallet');
    } finally { setVerifying(false); }
  };

  const handleSubmit = async () => {
    if (!walletStatus?.qualified) { setError('Please verify your wallet first'); return; }
    setSubmitting(true); setError('');
    try {
      await signup({ username:form.username, password:form.password, walletAddress:form.walletAddress });
      navigate('/dreamboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
      setStep(0);
    } finally { setSubmitting(false); }
  };

  const canProceedStep0 = form.username.length >= 2 && form.password.length >= 8 && form.password === form.confirmPassword && /^[a-z0-9_]{2,24}$/.test(form.username);

  return (
    <div className="page" style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,209,102,0.05) 0%, var(--void) 70%)',
    }}>
      <div style={{ width:'100%', maxWidth:480, padding:'0 20px' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{
            width:56, height:56, borderRadius:'50%', margin:'0 auto 14px',
            background:'linear-gradient(135deg, var(--gold), var(--coral))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.5rem', fontWeight:900, color:'var(--void)', fontFamily:'var(--font-display)',
          }}>1</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700 }}>Join the Dream</h1>
          <p style={{ color:'var(--text-3)', marginTop:6, fontSize:'0.85rem' }}>
            Hold the token. Post your dream. Win real SOL.
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:28 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:28, height:28, borderRadius:'50%',
                background: i < step ? 'var(--mint)' : i === step ? 'var(--gold)' : 'var(--elevated)',
                color: i <= step ? 'var(--void)' : 'var(--text-3)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'0.8rem', fontWeight:700, transition:'all 0.3s',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize:'0.78rem', color: i === step ? 'var(--text)' : 'var(--text-3)' }}>{s}</span>
              {i < STEPS.length - 1 && <div style={{ width:24, height:1, background: i < step ? 'var(--mint)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'32px' }}>

          {/* Step 0: Account */}
          {step === 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>
                Create your account
              </h2>

              <div>
                <label className="input-label">Username</label>
                <input
                  className="input"
                  placeholder="dream_hunter"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username:e.target.value.toLowerCase() }))}
                  autoComplete="username"
                />
                <p className="input-hint">Lowercase letters, numbers, underscores. 2–24 characters.</p>
                {form.username && !/^[a-z0-9_]{2,24}$/.test(form.username) && (
                  <p className="input-error">Invalid username format</p>
                )}
              </div>

              <div>
                <label className="input-label">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password:e.target.value }))}
                  autoComplete="new-password"
                />
                <p className="input-hint">Minimum 8 characters.</p>
              </div>

              <div>
                <label className="input-label">Confirm Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword:e.target.value }))}
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="input-error">Passwords don't match</p>
                )}
              </div>

              <button
                onClick={() => setStep(1)}
                disabled={!canProceedStep0}
                className="btn btn-primary"
                style={{ width:'100%', marginTop:4 }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 1: Wallet */}
          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              <div>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>
                  Connect your wallet
                </h2>
                <p style={{ fontSize:'0.83rem', color:'var(--text-2)', lineHeight:1.6 }}>
                  No browser extension needed. Just paste your Solana wallet address.
                  We verify your token holdings on-chain.
                </p>
              </div>

              <div style={{
                background:'var(--gold-glow)', border:'1px solid rgba(255,209,102,0.3)',
                borderRadius:'var(--r-md)', padding:'14px 16px',
              }}>
                <p style={{ fontSize:'0.82rem', color:'var(--gold)', fontWeight:600, marginBottom:4 }}>
                  ⚡ Requirement
                </p>
                <p style={{ fontSize:'0.8rem', color:'var(--text-2)' }}>
                  Must hold ≥ 1 SOL worth of the project token at current market price.
                  Wallet must have held for at least 30 minutes before actions unlock.
                </p>
              </div>

              <div>
                <label className="input-label">Solana Wallet Address</label>
                <textarea
                  className="input"
                  placeholder="Paste your Solana wallet address here..."
                  value={form.walletAddress}
                  onChange={e => setForm(f => ({ ...f, walletAddress:e.target.value.trim() }))}
                  rows={2}
                  style={{ resize:'none', fontFamily:'var(--font-mono)', fontSize:'0.82rem' }}
                />
              </div>

              {error && (
                <div style={{ background:'var(--coral-glow)', border:'1px solid var(--coral)', borderRadius:'var(--r-md)', padding:'10px 14px', fontSize:'0.83rem', color:'var(--coral)' }}>
                  {error}
                </div>
              )}

              <div style={{ display:'flex', gap:12 }}>
                <button onClick={() => { setStep(0); setError(''); }} className="btn btn-ghost" style={{ flex:1 }}>← Back</button>
                <button
                  onClick={handleVerifyWallet}
                  disabled={!form.walletAddress || verifying}
                  className="btn btn-primary"
                  style={{ flex:2 }}
                >
                  {verifying ? 'Verifying...' : 'Verify Wallet →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review & Create */}
          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>
                Ready to dream?
              </h2>

              {walletStatus?.qualified && (
                <div style={{
                  background:'var(--mint-glow)', border:'1px solid rgba(6,214,160,0.3)',
                  borderRadius:'var(--r-md)', padding:'16px',
                }}>
                  <p style={{ color:'var(--mint)', fontWeight:700, marginBottom:6, fontSize:'0.9rem' }}>✓ Wallet Verified</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:'0.8rem', color:'var(--text-2)' }}>
                    <div><span style={{ color:'var(--text-3)' }}>Token Balance</span><br /><span style={{ fontFamily:'var(--font-mono)', color:'var(--text)' }}>{walletStatus.tokenBalance?.toFixed(0) || 0} tokens</span></div>
                    <div><span style={{ color:'var(--text-3)' }}>SOL Value</span><br /><span style={{ fontFamily:'var(--font-mono)', color:'var(--mint)' }}>◎ {walletStatus.solValue?.toFixed(4) || 0}</span></div>
                  </div>
                </div>
              )}

              <div style={{ background:'var(--elevated)', borderRadius:'var(--r-md)', padding:'14px', fontSize:'0.83rem' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-3)' }}>Username</span>
                    <span style={{ fontFamily:'var(--font-mono)' }}>@{form.username}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-3)' }}>Wallet</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.75rem' }}>{form.walletAddress.slice(0,6)}...{form.walletAddress.slice(-4)}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ background:'var(--coral-glow)', border:'1px solid var(--coral)', borderRadius:'var(--r-md)', padding:'10px 14px', fontSize:'0.83rem', color:'var(--coral)' }}>
                  {error}
                </div>
              )}

              <div style={{ display:'flex', gap:12 }}>
                <button onClick={() => { setStep(1); setError(''); }} className="btn btn-ghost" style={{ flex:1 }}>← Back</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary" style={{ flex:2 }}>
                  {submitting ? 'Creating...' : '🌟 Create Account'}
                </button>
              </div>

              <p style={{ fontSize:'0.75rem', color:'var(--text-3)', textAlign:'center', lineHeight:1.5 }}>
                By joining, your wallet is permanently linked. One wallet per account. One account per wallet.
              </p>
            </div>
          )}
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:'0.85rem', color:'var(--text-3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--gold)', fontWeight:600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
