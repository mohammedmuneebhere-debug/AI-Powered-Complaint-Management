import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import { populateFromExtraction } from './complaintSlice';

export const extractFromFile = createAsyncThunk(
  'extraction/extractFile',
  async (file, { dispatch, rejectWithValue }) => {
    const formData = new FormData();
    formData.append('file', file);

    dispatch(setProgress({ progress: 10, message: 'Uploading document...' }));

    try {
      dispatch(setProgress({ progress: 30, message: 'Analyzing document content and extracting key details...' }));
      const { data } = await api.post('/complaints/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(setProgress({ progress: 90, message: 'Populating form fields...' }));
      dispatch(populateFromExtraction(data));
      dispatch(setProgress({ progress: 100, message: 'Extraction complete!' }));
      return data;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Extraction failed';
      return rejectWithValue(message);
    }
  }
);

export const extractFromText = createAsyncThunk(
  'extraction/extractText',
  async (text, { dispatch, rejectWithValue }) => {
    dispatch(setProgress({ progress: 10, message: 'Processing pasted text...' }));

    try {
      dispatch(setProgress({ progress: 30, message: 'Analyzing content and extracting key details...' }));
      const { data } = await api.post('/complaints/extract-text', { text });
      dispatch(setProgress({ progress: 90, message: 'Populating form fields...' }));
      dispatch(populateFromExtraction(data));
      dispatch(setProgress({ progress: 100, message: 'Extraction complete!' }));
      return data;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Extraction failed';
      return rejectWithValue(message);
    }
  }
);

const extractionSlice = createSlice({
  name: 'extraction',
  initialState: {
    isExtracting: false,
    progress: 0,
    statusMessage: '',
    error: null,
  },
  reducers: {
    setProgress: (state, action) => {
      state.progress = action.payload.progress;
      state.statusMessage = action.payload.message;
    },
    clearExtraction: (state) => {
      state.isExtracting = false;
      state.progress = 0;
      state.statusMessage = '';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(extractFromFile.pending, (state) => {
        state.isExtracting = true;
        state.error = null;
        state.progress = 0;
      })
      .addCase(extractFromFile.fulfilled, (state) => {
        state.isExtracting = false;
      })
      .addCase(extractFromFile.rejected, (state, action) => {
        state.isExtracting = false;
        state.error = action.payload;
        state.progress = 0;
        state.statusMessage = '';
      })
      .addCase(extractFromText.pending, (state) => {
        state.isExtracting = true;
        state.error = null;
        state.progress = 0;
      })
      .addCase(extractFromText.fulfilled, (state) => {
        state.isExtracting = false;
      })
      .addCase(extractFromText.rejected, (state, action) => {
        state.isExtracting = false;
        state.error = action.payload;
        state.progress = 0;
        state.statusMessage = '';
      });
  },
});

export const { setProgress, clearExtraction } = extractionSlice.actions;
export default extractionSlice.reducer;
