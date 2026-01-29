import './ChatbotInfo.css'

function ChatbotInfo() {
  return (
    <div className="chatbot-info">
      <div className="chatbot-info-icon">🤖</div>
      <div className="chatbot-info-content">
        <h3 className="chatbot-info-title">How to Use the Chatbot</h3>
        <ol className="chatbot-info-steps">
          <li>📤 <strong>Upload</strong> a PDF resume using the button above</li>
          <li>💬 <strong>Ask questions</strong> about the resume content</li>
          <li>✨ <strong>Get instant answers</strong> powered by AI</li>
        </ol>
        <div className="chatbot-info-examples">
          <span className="chatbot-info-label">Try asking:</span>
          <div className="chatbot-info-tags">
            <span>"What skills are mentioned?"</span>
            <span>"Tell me about work experience"</span>
            <span>"What's the education background?"</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatbotInfo
