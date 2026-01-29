import { useState, useRef, useEffect } from 'react'
import './App.css'
import ChatMessage from './components/ChatMessage'
import ResumeUpload from './components/ResumeUpload'
import Portfolio from './components/Portfolio'
import ChatbotInfo from './components/ChatbotInfo'

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hello! I'm your AI-powered Resume Assistant. 

Upload a resume above and I'll help you explore it! Ask me anything about the resume content - skills, experience, education, achievements, and more. 🚀`
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        throw new Error(data.error || 'No response from server')
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message || 'Connection error. Please check if the API is configured correctly.'}` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="main-container">
        {/* Portfolio Section - Full Width */}
        <div className="portfolio-container-full">
          <Portfolio />
        </div>

        {/* Chatbot Section - Two Columns Side by Side */}
        <div className="chatbot-container-full">
          <div className="chatbot-left-section">
            <div className="chatbot-header">
              <h1>Gen AI Chatbot</h1>
              <p className="chatbot-description">
                A mini AI project demonstrating my practical skills with GenAI using OpenAI LLM - A chatbot that showcases my ability to build intelligent, interactive applications for real-world use.
              </p>
              <ChatbotInfo />
              <ResumeUpload onUpload={handleResumeUpload} />
            </div>
          </div>
          
          <div className="chatbot-right-section">
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
      </div>
    </div>
  )
}

export default App
