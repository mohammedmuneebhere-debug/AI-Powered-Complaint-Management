import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import api from '../api/client';
import PageTransition from './PageTransition';
import AppFooter from './AppFooter';
import './AppLayout.css';

export default function AppLayout() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = () => {
      api.get('/stats')
        .then(({ data }) => setPendingCount((data.pending || 0) + (data.under_inspection || 0)))
        .catch(() => setPendingCount(0));
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="nav-inner">
          <NavLink to="/" className="nav-brand">
            <div className="brand-icon">
              <svg viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                <path d="M16 6c-2 4-2 8 0 12s2 8 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 6c2 4 2 8 0 12s-2 8 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="16" cy="10" r="2" fill="currentColor"/>
                <circle cx="16" cy="22" r="2" fill="currentColor"/>
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-name">AIVOA</span>
              <span className="brand-tag">Quality Assurance</span>
            </div>
          </NavLink>

          <div className="nav-links">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/>
                <rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
              </svg>
              Dashboard
            </NavLink>
            <NavLink to="/log-complaint" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              Log Complaint
            </NavLink>
            <NavLink to="/management" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Management
              {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="app-content">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <AppFooter />
    </div>
  );
}
