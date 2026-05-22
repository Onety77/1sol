import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useRoundStore } from '../../store/roundStore';
import { useState, useEffect } from 'react';
import CountdownTimer from '../ui/CountdownTimer';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { currentRound, potSOL } = useRoundStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinks = [
    { to: '/dreamboard', label: 'Dreamboard' },
    { to: '/arena', label: 'Arena' },
    { to: '/hall', label: 'Hall' },
    { to: '/graveyard', label: 'Graveyard' },
    { to: '/well', label: 'Wishing Well' },
  ];

  const activeLinkStyle = { color: 'var(--gold)' };
  const linkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--gold)' : 'var(--text-2)',
    fontSize: '0.85rem', fontWeight: 500,
    transition: 'color 0.2s',
    textDecoration: 'none',
  });

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(7,7,20,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s',
      height: 64,
    }}>
      <div style={{
        maxWidth: 1300, margin: '0 auto', padding: '0 24px',
        height: '100%', display: 'flex', alignItems: 'center', gap: 24,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold), var(--coral))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 900, color: 'var(--void)',
            fontFamily: 'var(--font-display)',
          }}>1</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '-0.02em', display: window.innerWidth < 500 ? 'none' : 'block' }}>
            SOL & A DREAM
          </span>
        </Link>

        {/* Nav links — desktop */}
        <div style={{ display: window.innerWidth < 900 ? 'none' : 'flex', gap: 20, flex: 1 }}>
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} style={linkStyle}
              onMouseEnter={e => { if (!e.target.style.color.includes('gold')) e.target.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.target.style.color = ''; }}
            >{l.label}</NavLink>
          ))}
        </div>

        {/* Round pill */}
        {currentRound && (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)',
            padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <span style={{ color: 'var(--gold)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              ◎ {typeof potSOL === 'number' ? potSOL.toFixed(2) : '0.00'}
            </span>
            <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
            <CountdownTimer endsAt={currentRound.endsAt} compact />
          </div>
        )}

        {/* Auth */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          {user ? (
            <>
              <Link to={`/profile/${user.walletAddress}`} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', padding: '6px 12px',
                fontSize: '0.82rem', color: 'var(--text)',
              }}>
                {user.profilePicUrl
                  ? <img src={user.profilePicUrl} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                  : <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--purple))', flexShrink: 0 }} />
                }
                <span style={{ display: window.innerWidth < 600 ? 'none' : 'block' }}>{user.username}</span>
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-ghost btn-sm">Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Join</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
