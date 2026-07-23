import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  complaintSource: '',
  customerName: '',
  productName: '',
  productStrength: '',
  batchLotNumber: '',
  manufacturingDate: '',
  expiryDate: '',
  quantityAffected: '',
  quantityUnit: 'kg',
  complaintType: '',
  complaintDate: '',
  description: '',
  initialSeverity: '',
  priority: '',
  status: 'pending_triage',
  sourceDocument: '',
  aiSummary: '',
  riskClassification: '',
  riskRationale: '',
  completenessScore: null,
  missingFields: [],
  rootCauseSuggestions: [],
  capaRecommendations: [],
  duplicateWarnings: [],
  aiConfidence: {},
  savedId: null,
  saveStatus: 'idle',
  saveError: null,
};

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    populateFromExtraction: (state, action) => {
      const data = action.payload;
      const fields = data.extracted_fields || data;
      state.complaintSource = fields.complaint_source || '';
      state.customerName = fields.customer_name || '';
      state.productName = fields.product_name || '';
      state.productStrength = fields.product_strength || '';
      state.batchLotNumber = fields.batch_lot_number || '';
      state.manufacturingDate = fields.manufacturing_date || '';
      state.expiryDate = fields.expiry_date || '';
      state.quantityAffected = fields.quantity_affected?.toString() || '';
      state.quantityUnit = fields.quantity_unit || 'kg';
      state.complaintType = fields.complaint_type || '';
      state.complaintDate = fields.complaint_date || '';
      state.description = fields.description || '';
      state.initialSeverity = fields.initial_severity || '';
      state.priority = fields.priority || '';
      state.sourceDocument = data.raw_text || '';
      state.aiSummary = data.ai_summary || '';
      state.riskClassification = data.risk_classification || '';
      state.riskRationale = data.risk_rationale || '';
      state.completenessScore = data.completeness_score ?? null;
      state.missingFields = data.missing_fields || [];
      state.rootCauseSuggestions = data.root_cause_suggestions || [];
      state.capaRecommendations = data.capa_recommendations || [];
      state.duplicateWarnings = data.duplicate_warnings || [];
      state.aiConfidence = data.ai_confidence || {};
    },
    resetForm: () => initialState,
    setSaveStatus: (state, action) => {
      state.saveStatus = action.payload.status;
      state.savedId = action.payload.id || null;
      state.saveError = action.payload.error || null;
    },
  },
});

export const { updateField, populateFromExtraction, resetForm, setSaveStatus } = complaintSlice.actions;
export default complaintSlice.reducer;

export const selectComplaintForm = (state) => state.complaint;

export const selectComplaintPayload = (state) => {
  const c = state.complaint;
  return {
    complaint_source: c.complaintSource || null,
    customer_name: c.customerName || null,
    product_name: c.productName || null,
    product_strength: c.productStrength || null,
    batch_lot_number: c.batchLotNumber || null,
    manufacturing_date: c.manufacturingDate || null,
    expiry_date: c.expiryDate || null,
    quantity_affected: c.quantityAffected ? parseFloat(c.quantityAffected) : null,
    quantity_unit: c.quantityUnit,
    complaint_type: c.complaintType || null,
    complaint_date: c.complaintDate || null,
    description: c.description || null,
    initial_severity: c.initialSeverity || null,
    priority: c.priority || null,
    status: c.status,
    source_document: c.sourceDocument || null,
    ai_summary: c.aiSummary || null,
    risk_classification: c.riskClassification || null,
    completeness_score: c.completenessScore,
    ai_insights: {
      risk_rationale: c.riskRationale,
      missing_fields: c.missingFields,
      root_cause_suggestions: c.rootCauseSuggestions,
      capa_recommendations: c.capaRecommendations,
      duplicate_warnings: c.duplicateWarnings,
    },
    ai_confidence: c.aiConfidence,
  };
};
