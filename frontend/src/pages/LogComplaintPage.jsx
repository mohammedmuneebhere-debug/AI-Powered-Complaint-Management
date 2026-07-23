import ComplaintForm from '../components/ComplaintForm';
import AIIntakePanel from '../components/AIIntakePanel';
import './LogComplaintPage.css';

export default function LogComplaintPage() {
  return (
    <div className="log-page">
      <div className="page-header animate-fade-in-up">
        <div>
          <h1>Log Customer Complaint</h1>
          <p>AI-assisted intake with automatic field extraction from documents</p>
        </div>
        <div className="header-pill">
          <span className="pill-dot" />
          Live Intake
        </div>
      </div>

      <div className="log-layout">
        <div className="form-column animate-slide-left">
          <ComplaintForm />
        </div>
        <div className="ai-column animate-slide-right">
          <AIIntakePanel />
        </div>
      </div>
    </div>
  );
}
