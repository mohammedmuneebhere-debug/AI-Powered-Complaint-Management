import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/client';
import { useToast } from '../components/Toast';
import KanbanBoard from '../components/KanbanBoard';
import {
  STATUS_CONFIG, ACTION_TYPES, formatDate, formatDateTime, truncate, shortId,
} from '../constants/status';
import './ManagementPage.css';

export default function ManagementPage() {
  const toast = useToast();
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('list');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [actionType, setActionType] = useState('');
  const [author, setAuthor] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/complaints');
      setAllComplaints(data);
    } catch {
      setAllComplaints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotes = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/complaints/${id}/notes`);
      setNotes(data);
    } catch {
      setNotes([]);
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);
  useEffect(() => {
    if (selected) fetchNotes(selected.id);
    else setNotes([]);
  }, [selected, fetchNotes]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/complaints/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
      fetchComplaints();
      if (selected?.id === id) {
        setSelected((prev) => ({ ...prev, status: newStatus }));
        fetchNotes(id);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || !selected) return;
    setSaving(true);
    try {
      await api.post(`/complaints/${selected.id}/notes`, {
        note_text: noteText,
        action_type: actionType || null,
        author: author || null,
      });
      setNoteText('');
      setActionType('');
      toast.success('Note added successfully');
      fetchNotes(selected.id);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!selected) return;
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaint-${shortId(selected.id)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.info('Complaint exported as JSON');
  };

  const statusCounts = allComplaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const complaints = useMemo(() => {
    let result = [...allComplaints];

    if (filter !== 'all') result = result.filter((c) => c.status === filter);
    if (severityFilter !== 'all') result = result.filter((c) => c.initial_severity === severityFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        [c.product_name, c.customer_name, c.batch_lot_number, c.description, c.complaint_type]
          .some((f) => f?.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'severity') {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return (order[a.initial_severity] ?? 4) - (order[b.initial_severity] ?? 4);
      }
      return 0;
    });

    return result;
  }, [allComplaints, filter, severityFilter, search, sortBy]);

  return (
    <div className="mgmt-page">
      <div className="page-header animate-fade-in-up">
        <div>
          <h1>Complaint Management</h1>
          <p>Track inspection status, confirm complaints, and document actions taken</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            <button
              className={viewMode === 'kanban' ? 'active' : ''}
              onClick={() => setViewMode('kanban')}
              title="Kanban board"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="10" rx="1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="status-pipeline animate-fade-in-up stagger-1">
        {Object.entries(STATUS_CONFIG).slice(0, 5).map(([key, cfg]) => (
          <button
            key={key}
            className={`pipeline-step ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(filter === key ? 'all' : key)}
          >
            <span className={`step-icon step-${cfg.color}`}>{cfg.icon}</span>
            <span className="step-label">{cfg.label}</span>
            <span className="step-count">{statusCounts[key] || 0}</span>
          </button>
        ))}
        <button
          className={`pipeline-step ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <span className="step-icon step-all">📋</span>
          <span className="step-label">All</span>
          <span className="step-count">{allComplaints.length}</span>
        </button>
      </div>

      <div className="mgmt-toolbar animate-fade-in-up stagger-2">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search product, customer, batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="toolbar-select">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="severity">By severity</option>
        </select>
        <div className="severity-chips">
          {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
            <button
              key={s}
              className={`severity-chip ${severityFilter === s ? 'active' : ''} sev-${s}`}
              onClick={() => setSeverityFilter(s)}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="kanban-wrapper animate-fade-in">
          <KanbanBoard
            complaints={complaints}
            onSelect={setSelected}
            selectedId={selected?.id}
          />
          {selected && (
            <div className="kanban-detail-overlay" onClick={() => setSelected(null)}>
              <div className="kanban-detail-panel" onClick={(e) => e.stopPropagation()}>
                <ComplaintDetail
                  selected={selected}
                  notes={notes}
                  noteText={noteText}
                  setNoteText={setNoteText}
                  actionType={actionType}
                  setActionType={setActionType}
                  author={author}
                  setAuthor={setAuthor}
                  saving={saving}
                  onStatusChange={handleStatusChange}
                  onAddNote={handleAddNote}
                  onExport={handleExport}
                  onClose={() => setSelected(null)}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mgmt-layout">
          <div className="complaints-list animate-slide-left">
            {loading ? (
              <div className="skeleton-list">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton-item" />)}
              </div>
            ) : complaints.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p>No complaints found</p>
                <span>Try adjusting filters or log a new complaint</span>
              </div>
            ) : (
              complaints.map((c, i) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending_triage;
                return (
                  <div
                    key={c.id}
                    className={`complaint-card ${selected?.id === c.id ? 'selected' : ''}`}
                    onClick={() => setSelected(c)}
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="card-top">
                      <span className="card-id">{shortId(c.id)}</span>
                      <span className={`status-chip status-${cfg.color}`}>{cfg.label}</span>
                      {c.risk_classification && (
                        <span className={`risk-chip risk-${c.risk_classification}`}>
                          {c.risk_classification}
                        </span>
                      )}
                    </div>
                    <h3>{c.product_name || 'Unnamed Product'}</h3>
                    <p className="card-meta">
                      <span>{c.customer_name || 'Unknown customer'}</span>
                      <span>Batch: {c.batch_lot_number || '—'}</span>
                    </p>
                    <p className="card-desc">{truncate(c.description)}</p>
                    <div className="card-footer">
                      <span>{formatDate(c.complaint_date || c.created_at)}</span>
                      <span className={`severity severity-${c.initial_severity}`}>
                        {c.initial_severity || '—'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="complaint-detail animate-slide-right">
            {selected ? (
              <ComplaintDetail
                selected={selected}
                notes={notes}
                noteText={noteText}
                setNoteText={setNoteText}
                actionType={actionType}
                setActionType={setActionType}
                author={author}
                setAuthor={setAuthor}
                saving={saving}
                onStatusChange={handleStatusChange}
                onAddNote={handleAddNote}
                onExport={handleExport}
              />
            ) : (
              <div className="detail-empty">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
                </svg>
                <p>Select a complaint to view details and add notes</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ComplaintDetail({
  selected, notes, noteText, setNoteText, actionType, setActionType,
  author, setAuthor, saving, onStatusChange, onAddNote, onExport, onClose,
}) {
  return (
    <>
      <div className="detail-header">
        <div>
          <span className={`status-chip status-${STATUS_CONFIG[selected.status]?.color}`}>
            {STATUS_CONFIG[selected.status]?.label}
          </span>
          <h2>{selected.product_name || 'Complaint Detail'}</h2>
          <p className="detail-id">ID: {shortId(selected.id)}</p>
        </div>
        <div className="detail-header-actions">
          <button className="btn-icon" onClick={onExport} title="Export JSON">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          {onClose && (
            <button className="btn-icon" onClick={onClose} title="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          {STATUS_CONFIG[selected.status]?.next && (
            <button
              className="btn-advance"
              onClick={() => onStatusChange(selected.id, STATUS_CONFIG[selected.status].next)}
            >
              {STATUS_CONFIG[selected.status].nextLabel}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-field"><label>Customer</label><span>{selected.customer_name || '—'}</span></div>
        <div className="detail-field"><label>Batch / Lot</label><span>{selected.batch_lot_number || '—'}</span></div>
        <div className="detail-field"><label>Type</label><span>{selected.complaint_type || '—'}</span></div>
        <div className="detail-field">
          <label>Severity</label>
          <span className={`severity severity-${selected.initial_severity}`}>{selected.initial_severity || '—'}</span>
        </div>
        <div className="detail-field"><label>Priority</label><span>{selected.priority || '—'}</span></div>
        <div className="detail-field">
          <label>Risk</label>
          <span className={`risk-chip risk-${selected.risk_classification}`}>{selected.risk_classification || '—'}</span>
        </div>
      </div>

      {selected.description && (
        <div className="detail-description">
          <label>Description</label>
          <p>{selected.description}</p>
        </div>
      )}

      {selected.ai_summary && (
        <div className="detail-ai-summary">
          <label>AI Summary</label>
          <p>{selected.ai_summary}</p>
        </div>
      )}

      <div className="status-actions">
        <label>Change Status</label>
        <div className="status-buttons">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              className={`status-btn ${selected.status === key ? 'current' : ''}`}
              onClick={() => onStatusChange(selected.id, key)}
              disabled={selected.status === key}
            >
              {cfg.icon} {cfg.label}
            </button>
          ))}
        </div>
      </div>

      <div className="notes-section">
        <h3>Action Notes &amp; Timeline</h3>
        <form className="note-form" onSubmit={onAddNote}>
          <div className="note-form-row">
            <select value={actionType} onChange={(e) => setActionType(e.target.value)}>
              <option value="">Action type (optional)</option>
              {ACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Document the action taken, investigation findings, or follow-up notes..."
            rows={3}
          />
          <button type="submit" className="btn-add-note" disabled={!noteText.trim() || saving}>
            {saving ? 'Saving...' : 'Add Note'}
          </button>
        </form>

        <div className="notes-timeline">
          {notes.length === 0 ? (
            <p className="no-notes">No notes yet. Status changes are logged automatically.</p>
          ) : (
            notes.map((note, i) => (
              <div key={note.id} className="note-item" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="note-timeline-dot" />
                <div className="note-content">
                  <div className="note-header">
                    {note.action_type && <span className="note-action-type">{note.action_type}</span>}
                    <span className="note-date">{formatDateTime(note.created_at)}</span>
                  </div>
                  <p className="note-text">{note.note_text}</p>
                  {note.author && <span className="note-author">— {note.author}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
