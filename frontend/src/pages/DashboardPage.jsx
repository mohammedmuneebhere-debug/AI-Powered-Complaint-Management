import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { STATUS_CONFIG, formatDate, shortId } from '../constants/status';
import './DashboardPage.css';

function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <button className={`stat-card stat-${color}`} onClick={onClick} type="button">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
        {sub && <span className="stat-card-sub">{sub}</span>}
      </div>
    </button>
  );
}

function BarChart({ data, colors }) {
  const max = Math.max(...Object.values(data), 1);
  return (
    <div className="bar-chart">
      {Object.entries(data).map(([key, val]) => (
        <div key={key} className="bar-row">
          <span className="bar-label">{key?.replace(/_/g, ' ') || 'unknown'}</span>
          <div className="bar-track">
            <div
              className={`bar-fill bar-${colors[key] || 'default'}`}
              style={{ width: `${(val / max) * 100}%` }}
            />
          </div>
          <span className="bar-value">{val}</span>
        </div>
      ))}
    </div>
  );
}

const SEVERITY_COLORS = { low: 'success', medium: 'warning', high: 'orange', critical: 'danger' };
const STATUS_COLORS = {
  pending_triage: 'warning',
  under_inspection: 'info',
  confirmed: 'purple',
  action_taken: 'success',
  resolved: 'success',
  closed: 'gray',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-skeleton">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-empty">
        <p>Unable to load dashboard data. Ensure the backend is running.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header animate-fade-in-up">
        <div>
          <h1>QA Dashboard</h1>
          <p>Real-time overview of complaint intake and resolution pipeline</p>
        </div>
        <button className="btn-dashboard-cta" onClick={() => navigate('/log-complaint')}>
          + New Complaint
        </button>
      </div>

      <div className="stats-grid animate-fade-in-up stagger-1">
        <StatCard
          icon="📋"
          label="Total Complaints"
          value={stats.total}
          color="primary"
          onClick={() => navigate('/management')}
        />
        <StatCard
          icon="⏳"
          label="Pending Triage"
          value={stats.pending}
          sub="Awaiting review"
          color="warning"
          onClick={() => navigate('/management')}
        />
        <StatCard
          icon="🔍"
          label="Under Inspection"
          value={stats.under_inspection}
          color="info"
          onClick={() => navigate('/management')}
        />
        <StatCard
          icon="🚨"
          label="Critical Items"
          value={stats.critical}
          sub="High priority attention"
          color="danger"
          onClick={() => navigate('/management')}
        />
      </div>

      <div className="dashboard-grid animate-fade-in-up stagger-2">
        <div className="dashboard-panel">
          <h3>Status Breakdown</h3>
          {Object.keys(stats.status_breakdown).length > 0 ? (
            <BarChart data={stats.status_breakdown} colors={STATUS_COLORS} />
          ) : (
            <p className="panel-empty">No complaints yet</p>
          )}
        </div>

        <div className="dashboard-panel">
          <h3>Severity Distribution</h3>
          {Object.keys(stats.severity_breakdown).length > 0 ? (
            <BarChart data={stats.severity_breakdown} colors={SEVERITY_COLORS} />
          ) : (
            <p className="panel-empty">No severity data yet</p>
          )}
        </div>

        <div className="dashboard-panel panel-wide">
          <div className="panel-header-row">
            <h3>Recent Complaints</h3>
            <button className="link-btn" onClick={() => navigate('/management')}>
              View all →
            </button>
          </div>
          {stats.recent.length > 0 ? (
            <div className="recent-list">
              {stats.recent.map((c) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending_triage;
                return (
                  <div
                    key={c.id}
                    className="recent-item"
                    onClick={() => navigate('/management')}
                  >
                    <div className="recent-left">
                      <span className="recent-id">{shortId(c.id)}</span>
                      <div>
                        <span className="recent-product">{c.product_name || 'Unnamed'}</span>
                        <span className="recent-customer">{c.customer_name || '—'}</span>
                      </div>
                    </div>
                    <div className="recent-right">
                      <span className={`status-chip status-${cfg.color}`}>{cfg.label}</span>
                      {c.initial_severity && (
                        <span className={`severity severity-${c.initial_severity}`}>
                          {c.initial_severity}
                        </span>
                      )}
                      <span className="recent-date">{formatDate(c.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="panel-empty">No recent complaints. Log your first complaint to get started.</p>
          )}
        </div>

        {stats.avg_completeness != null && (
          <div className="dashboard-panel completeness-panel">
            <h3>AI Completeness</h3>
            <div className="completeness-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--gray-100)" strokeWidth="10"/>
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke="url(#grad)" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${stats.avg_completeness * 3.27} 327`}
                  transform="rotate(-90 60 60)"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--accent)" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="completeness-pct">{stats.avg_completeness}%</span>
            </div>
            <p className="completeness-label">Average extraction completeness across all complaints</p>
          </div>
        )}
      </div>
    </div>
  );
}
