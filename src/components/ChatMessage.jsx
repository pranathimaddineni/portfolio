import './ChatMessage.css'

function ChatMessage({ message }) {
  return (
    <div className={`message ${message.role}`}>
      {message.content}
    </div>
  )
}

export default ChatMessage
