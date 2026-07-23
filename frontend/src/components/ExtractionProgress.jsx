import { useSelector } from 'react-redux';
import './ExtractionProgress.css';

export default function ExtractionProgress() {
  const { isExtracting, progress, statusMessage, error } = useSelector((state) => state.extraction);

  if (!isExtracting && !error) return null;

  return (
    <div className="extraction-progress">
      {error ? (
        <div className="extraction-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      ) : (
        <>
          <div className="progress-header">
            <span className="progress-label">Extraction Progress</span>
            <span className="progress-pct">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-message">{statusMessage}</p>
        </>
      )}
    </div>
  );
}
