import { useState, useRef, useEffect } from 'react'
import './App.css'
import ChatMessage from './components/ChatMessage'
import ResumeUpload from './components/ResumeUpload'

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! Upload a resume and I can answer questions about it.'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleResumeUpload = async (text) => {
    if (text && text.trim().length > 0) {
      setResumeText(text)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Resume uploaded successfully! I've processed ${text.length} characters. You can now ask questions about it.`
      }])
    } else {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: The resume was uploaded but no text could be extracted. Please ensure the PDF contains readable text.'
      }])
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!resumeText) {
      setMessages(prev => [...prev, {
        role: 'user',
        content: input
      }, {
        role: 'assistant',
        content: 'Please upload a resume first before asking questions.'
      }])
      setInput('')
      return
    }

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          resumeText: resumeText,
          conversationHistory: messages
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${data.error || 'Failed to get response'}` 
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <h1>Resume Chatbot</h1>
          <ResumeUpload onUpload={handleResumeUpload} />
        </div>
        
        <div className="messages-container">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the resume..."
            disabled={isLoading}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
