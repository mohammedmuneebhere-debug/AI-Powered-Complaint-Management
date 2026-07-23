import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'AI Extraction',
    desc: 'Auto-populate complaint forms from PDFs, emails & documents',
    accent: 'teal',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: 'Risk Classification',
    desc: 'Intelligent severity scoring & regulatory risk assessment',
    accent: 'amber',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
      </svg>
    ),
    title: 'CAPA Insights',
    desc: 'Root cause analysis & corrective action recommendations',
    accent: 'violet',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="bio-orb bio-orb-1" />
        <div className="bio-orb bio-orb-2" />
        <div className="bio-orb bio-orb-3" />
        <div className="grid-overlay" />
      </div>

      <header className="landing-header animate-fade-in">
        <div className="landing-logo">
          <div className="logo-mark">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
              <path d="M24 8c-3 6-3 12 0 18s3 12 0 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M24 8c3 6 3 12 0 18s-3 12 0 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="24" cy="14" r="3" fill="currentColor"/>
              <circle cx="24" cy="34" r="3" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <span className="logo-text">AIVOA</span>
            <span className="logo-sub">Quality Assurance Platform</span>
          </div>
        </div>
      </header>

      <main className="landing-hero">
        <div className="hero-badge animate-fade-in-up stagger-1">
          <span className="badge-dot" />
          Pharmaceutical Quality Intelligence
        </div>

        <h1 className="hero-title animate-fade-in-up stagger-2">
          AI-Powered<br />
          <span className="hero-highlight">Complaint Management</span>
        </h1>

        <p className="hero-subtitle animate-fade-in-up stagger-3">
          Streamline customer complaint intake, triage, and resolution with intelligent
          document extraction and real-time QA insights.
        </p>

        <div className="hero-actions animate-fade-in-up stagger-4">
          <button className="btn-hero-primary" onClick={() => navigate('/log-complaint')}>
            Start Complaint Intake
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <button className="btn-hero-secondary" onClick={() => navigate('/dashboard')}>
            View Dashboard
          </button>
          <button className="btn-hero-secondary" onClick={() => navigate('/management')}>
            Complaint Board
          </button>
        </div>

        <div className="landing-features animate-fade-in-up stagger-5">
          {FEATURES.map((f) => (
            <div key={f.title} className={`feature-card accent-${f.accent}`}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="landing-footer animate-fade-in">
        <p>AIVOA Quality Assurance Module &bull; Pharmaceutical Manufacturing</p>
      </footer>
    </div>
  );
}
