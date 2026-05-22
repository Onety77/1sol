import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useEffect } from 'react';
import { listenCurrentRound, listenGlobalStats } from '../../services/firebase';
import { useRoundStore } from '../../store/roundStore';

export default function Layout() {
  const setCurrentRound = useRoundStore(s => s.setCurrentRound);
  const setGlobalStats = useRoundStore(s => s.setGlobalStats);

  useEffect(() => {
    const unsubRound = listenCurrentRound(setCurrentRound);
    const unsubStats = listenGlobalStats(setGlobalStats);
    return () => { unsubRound(); unsubStats(); };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '24px',
        textAlign: 'center', color: 'var(--text-3)', fontSize: '0.78rem',
        fontFamily: 'var(--font-mono)',
      }}>
        1 SOL AND A DREAM &nbsp;·&nbsp; Post your dream. Win real funding. &nbsp;·&nbsp;
        Built on <span style={{ color: 'var(--mint)' }}>Solana</span>
      </footer>
    </div>
  );
}
