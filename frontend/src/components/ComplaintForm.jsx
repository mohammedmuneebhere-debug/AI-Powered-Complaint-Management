import { useDispatch, useSelector } from 'react-redux';
import { updateField, resetForm, setSaveStatus, selectComplaintPayload } from '../store/slices/complaintSlice';
import { useToast } from './Toast';
import api from '../api/client';
import './ComplaintForm.css';

const SEVERITY_OPTIONS = ['', 'low', 'medium', 'high', 'critical'];
const PRIORITY_OPTIONS = ['', 'low', 'medium', 'high', 'urgent'];

function FormField({ label, field, type = 'text', placeholder, options, rows, unit }) {
  const dispatch = useDispatch();
  const value = useSelector((state) => state.complaint[field]);

  const handleChange = (e) => {
    dispatch(updateField({ field, value: e.target.value }));
  };

  const snakeField = field.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  const conf = useSelector((state) => state.complaint.aiConfidence?.[snakeField]);

  return (
    <div className="form-field">
      <label>
        {label}
        {conf > 0 && <span className="ai-badge" title="AI extracted">AI</span>}
      </label>
      {options ? (
        <select value={value} onChange={handleChange}>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : 'Select...'}
            </option>
          ))}
        </select>
      ) : rows ? (
        <textarea value={value} onChange={handleChange} placeholder={placeholder} rows={rows} />
      ) : (
        <div className={unit ? 'input-with-unit' : ''}>
          <input type={type} value={value} onChange={handleChange} placeholder={placeholder} />
          {unit && <span className="unit">{unit}</span>}
        </div>
      )}
    </div>
  );
}

export default function ComplaintForm() {
  const dispatch = useDispatch();
  const toast = useToast();
  const status = useSelector((state) => state.complaint.status);
  const saveStatus = useSelector((state) => state.complaint.saveStatus);
  const savedId = useSelector((state) => state.complaint.savedId);
  const saveError = useSelector((state) => state.complaint.saveError);
  const description = useSelector((state) => state.complaint.description);
  const payload = useSelector(selectComplaintPayload);

  const handleSave = async () => {
    dispatch(setSaveStatus({ status: 'saving' }));
    try {
      const { data } = await api.post('/complaints', payload);
      dispatch(setSaveStatus({ status: 'saved', id: data.id }));
      toast.success(`Complaint saved! ID: ${data.id.slice(0, 8).toUpperCase()}`);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      dispatch(setSaveStatus({ status: 'error', error: msg }));
      toast.error(`Failed to save: ${msg}`);
    }
  };

  const handleReset = () => {
    dispatch(resetForm());
    toast.info('Form reset');
  };

  const statusLabel = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="complaint-form">
      <div className="form-header">
        <div>
          <h2>Complaint Details</h2>
          <p className="subtitle">Complete all sections or let AI auto-fill from documents</p>
        </div>
        <span className={`status-badge status-${status}`}>{statusLabel}</span>
      </div>

      <section className="form-section">
        <h2><span className="section-num">1</span> Origin &amp; Customer Details</h2>
        <div className="form-grid">
          <FormField label="Complaint Source" field="complaintSource" placeholder="e.g. Email, Letter, Phone" />
          <FormField label="Customer Name" field="customerName" placeholder="Customer or organization name" />
        </div>
      </section>

      <section className="form-section">
        <h2><span className="section-num">2</span> Product &amp; Batch Identification</h2>
        <div className="form-grid">
          <FormField label="Product Name" field="productName" placeholder="e.g. Metformin Tablets" />
          <FormField label="Product Strength/Grade" field="productStrength" placeholder="e.g. 500mg" />
          <FormField label="Batch/Lot Number" field="batchLotNumber" placeholder="e.g. ABC-2024-0891" />
          <FormField label="Manufacturing Date" field="manufacturingDate" type="date" />
          <FormField label="Expiry Date" field="expiryDate" type="date" />
          <FormField label="Quantity Affected" field="quantityAffected" type="number" placeholder="0" unit="kg" />
        </div>
      </section>

      <section className="form-section">
        <h2><span className="section-num">3</span> Complaint Details</h2>
        <div className="form-grid">
          <FormField label="Complaint Type" field="complaintType" placeholder="e.g. Quality, Packaging, Labeling" />
          <FormField label="Complaint Date" field="complaintDate" type="date" />
          <div className="form-field full-width">
            <label>Detailed Complaint Description</label>
            <textarea
              value={description}
              onChange={(e) => dispatch(updateField({ field: 'description', value: e.target.value }))}
              placeholder="Describe the complaint in detail..."
              rows={4}
            />
          </div>
        </div>
      </section>

      <section className="form-section">
        <h2><span className="section-num">4</span> Initial Assessment &amp; Priority</h2>
        <div className="form-grid">
          <FormField label="Initial Severity" field="initialSeverity" options={SEVERITY_OPTIONS} />
          <FormField label="Priority" field="priority" options={PRIORITY_OPTIONS} />
        </div>
      </section>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={handleReset}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          Reset Form
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saveStatus === 'saving'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {saveStatus === 'saving' ? 'Saving...' : 'Save Complaint'}
        </button>
      </div>

      {saveStatus === 'saved' && (
        <div className="save-toast success">Complaint saved successfully! ID: {savedId}</div>
      )}
      {saveStatus === 'error' && (
        <div className="save-toast error">Failed to save: {saveError}</div>
      )}
    </div>
  );
}
