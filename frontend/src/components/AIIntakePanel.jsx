import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { extractFromFile, extractFromText, clearExtraction } from '../store/slices/extractionSlice';
import { useToast } from './Toast';
import ExtractionProgress from './ExtractionProgress';
import ChatAssistant from './ChatAssistant';
import AIInsights from './AIInsights';
import './AIIntakePanel.css';

export default function AIIntakePanel() {
  const dispatch = useDispatch();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const isExtracting = useSelector((state) => state.extraction.isExtracting);
  const extractionError = useSelector((state) => state.extraction.error);
  const hasInsights = useSelector((state) => !!state.complaint.aiSummary);
  const progress = useSelector((state) => state.extraction.progress);

  useEffect(() => {
    if (progress === 100 && !extractionError) {
      toast.success('Document analyzed — form fields populated');
      dispatch(clearExtraction());
    }
  }, [progress, extractionError, toast, dispatch]);

  useEffect(() => {
    if (extractionError) {
      toast.error(extractionError);
    }
  }, [extractionError, toast]);

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt', 'eml'].includes(ext)) {
      alert('Unsupported file type. Please upload PDF, DOCX, TXT, or EML.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File exceeds 10MB limit.');
      return;
    }
    dispatch(extractFromFile(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return;
    setShowPasteModal(false);
    dispatch(extractFromText(pasteText));
    setPasteText('');
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <h2>AI Complaint Intake Assistant</h2>
        <span className="beta-badge">BETA</span>
      </div>

      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${isExtracting ? 'disabled' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isExtracting && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.eml"
          hidden
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <svg className="upload-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p className="drop-text">Drag &amp; drop complaint document here</p>
        <p className="drop-sub">or click to browse</p>
      </div>

      <button
        className="paste-btn"
        onClick={() => setShowPasteModal(true)}
        disabled={isExtracting}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
        Paste Complaint Text / Email
      </button>

      <div className="format-info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        Supported formats: PDF, DOCX, TXT, EML &bull; Max file size: 10MB
      </div>

      {(isExtracting || extractionError) && <ExtractionProgress />}

      {hasInsights && <AIInsights />}

      <ChatAssistant />

      {showPasteModal && (
        <div className="modal-overlay" onClick={() => setShowPasteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Paste Complaint Text / Email</h3>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste the full complaint email or letter text here..."
              rows={12}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowPasteModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePasteSubmit} disabled={!pasteText.trim()}>
                Extract &amp; Populate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
