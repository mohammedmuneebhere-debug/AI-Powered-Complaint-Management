import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage, addUserMessage } from '../store/slices/chatSlice';
import { selectComplaintForm } from '../store/slices/complaintSlice';
import './ChatAssistant.css';

export default function ChatAssistant() {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const messages = useSelector((state) => state.chat.messages);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const isStreaming = useSelector((state) => state.chat.isStreaming);
  const streamingContent = useSelector((state) => state.chat.streamingContent);
  const complaint = useSelector(selectComplaintForm);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    dispatch(addUserMessage(message));

    const context = {
      complaint_source: complaint.complaintSource,
      customer_name: complaint.customerName,
      product_name: complaint.productName,
      product_strength: complaint.productStrength,
      batch_lot_number: complaint.batchLotNumber,
      complaint_type: complaint.complaintType,
      description: complaint.description,
      initial_severity: complaint.initialSeverity,
      priority: complaint.priority,
      ai_summary: complaint.aiSummary,
      risk_classification: complaint.riskClassification,
    };

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    dispatch(sendChatMessage({ message, complaintContext: context, conversationHistory: history }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-assistant">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="chat-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
                </svg>
              </div>
            )}
            <div className="chat-content">{msg.content}</div>
          </div>
        ))}
        {isStreaming && (
          <div className="chat-bubble assistant">
            <div className="chat-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/>
              </svg>
            </div>
            <div className="chat-content">
              {streamingContent || <span className="typing">Thinking...</span>}
            </div>
          </div>
        )}
        {isLoading && !isStreaming && (
          <div className="chat-bubble assistant">
            <div className="chat-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/>
              </svg>
            </div>
            <div className="chat-content typing">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about this complaint..."
          disabled={isLoading}
        />
        <button className="chat-send" onClick={handleSend} disabled={!input.trim() || isLoading}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <p className="chat-disclaimer">AI responses may contain errors. Please verify information.</p>
    </div>
  );
}
