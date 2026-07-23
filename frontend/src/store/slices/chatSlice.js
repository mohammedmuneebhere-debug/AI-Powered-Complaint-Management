import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, complaintContext, conversationHistory }, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          complaint_context: complaintContext,
          conversation_history: conversationHistory,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: response.statusText }));
        return rejectWithValue(err.detail || 'Chat failed');
      }

      dispatch(startStreamingReply());

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullReply += chunk;
        dispatch(appendStreamingToken(chunk));
      }

      dispatch(finishStreamingReply());
      return { role: 'assistant', content: fullReply };
    } catch (err) {
      return rejectWithValue(err.message || 'Chat failed');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [
      {
        role: 'assistant',
        content:
          "Hello! I'm your AI Complaint Intake Assistant. Upload a complaint document or paste text, and I'll automatically extract and populate the form fields. You can also ask me questions about the complaint.",
      },
    ],
    isLoading: false,
    isStreaming: false,
    streamingContent: '',
    error: null,
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ role: 'user', content: action.payload });
    },
    startStreamingReply: (state) => {
      state.isStreaming = true;
      state.streamingContent = '';
      state.isLoading = true;
    },
    appendStreamingToken: (state, action) => {
      state.streamingContent += action.payload;
    },
    finishStreamingReply: (state) => {
      state.isStreaming = false;
      state.isLoading = false;
    },
    clearChat: (state) => {
      state.messages = [
        {
          role: 'assistant',
          content:
            "Hello! I'm your AI Complaint Intake Assistant. Upload a complaint document or paste text, and I'll automatically extract and populate the form fields. You can also ask me questions about the complaint.",
        },
      ];
      state.error = null;
      state.streamingContent = '';
      state.isStreaming = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isStreaming = false;
        state.streamingContent = '';
        state.messages.push(action.payload);
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isStreaming = false;
        state.streamingContent = '';
        state.error = action.payload;
        state.messages.push({
          role: 'assistant',
          content: `Sorry, I encountered an error: ${action.payload}`,
        });
      });
  },
});

export const { addUserMessage, clearChat, startStreamingReply, appendStreamingToken, finishStreamingReply } =
  chatSlice.actions;
export default chatSlice.reducer;
