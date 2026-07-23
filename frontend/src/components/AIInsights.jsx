import { useState } from 'react';
import { useSelector } from 'react-redux';
import './AIInsights.css';

export default function AIInsights() {
  const [expanded, setExpanded] = useState(true);
  const {
    aiSummary,
    riskClassification,
    riskRationale,
    completenessScore,
    missingFields,
    rootCauseSuggestions,
    capaRecommendations,
    duplicateWarnings,
  } = useSelector((state) => state.complaint);

  if (!aiSummary && !riskClassification) return null;

  const riskClass = riskClassification?.toLowerCase() || '';

  return (
    <div className="ai-insights">
      <button className="insights-toggle" onClick={() => setExpanded(!expanded)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
        AI Insights
        <svg className={`chevron ${expanded ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div className="insights-body">
          {aiSummary && (
            <div className="insight-card">
              <h4>Complaint Summary</h4>
              <p>{aiSummary}</p>
            </div>
          )}

          <div className="insights-row">
            {riskClassification && (
              <div className="insight-card">
                <h4>Risk Classification</h4>
                <span className={`risk-badge risk-${riskClass}`}>{riskClassification}</span>
                {riskRationale && <p className="insight-detail">{riskRationale}</p>}
              </div>
            )}

            {completenessScore != null && (
              <div className="insight-card">
                <h4>Completeness Score</h4>
                <div className="score-ring">
                  <span className="score-value">{Math.round(completenessScore)}%</span>
                </div>
                {missingFields?.length > 0 && (
                  <div className="missing-fields">
                    <span className="missing-label">Missing:</span>
                    {missingFields.map((f, i) => (
                      <span key={i} className="missing-tag">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {rootCauseSuggestions?.length > 0 && (
            <div className="insight-card">
              <h4>Root Cause Suggestions</h4>
              <ul>
                {rootCauseSuggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {capaRecommendations?.length > 0 && (
            <div className="insight-card">
              <h4>CAPA Recommendations</h4>
              <ul>
                {capaRecommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {duplicateWarnings?.length > 0 && (
            <div className="insight-card warning">
              <h4>Duplicate Complaint Warnings</h4>
              {duplicateWarnings.map((w, i) => (
                <div key={i} className="duplicate-item">
                  <span className="dup-confidence">{Math.round((w.confidence || 0) * 100)}% match</span>
                  <p>{w.similarity_reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
