import './AppFooter.css';

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <span>AIVOA Quality Assurance Module v1.0</span>
        <span className="footer-divider">•</span>
        <span>Pharmaceutical Complaint Intelligence</span>
        <span className="footer-divider">•</span>
        <span className="footer-ai">Powered by LangGraph + Groq</span>
      </div>
    </footer>
  );
}
