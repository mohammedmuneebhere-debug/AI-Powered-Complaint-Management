import { configureStore } from '@reduxjs/toolkit';
import complaintReducer from './slices/complaintSlice';
import extractionReducer from './slices/extractionSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    complaint: complaintReducer,
    extraction: extractionReducer,
    chat: chatReducer,
  },
});
