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
  const [apiStatus, setApiStatus] = useState('unknown')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check API health on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch('/api/health')
        if (response.ok) {
          const data = await response.json()
          setApiStatus(data.hasApiKey ? 'ready' : 'no-key')
          console.log('API Status:', data)
        } else {
          setApiStatus('error')
        }
      } catch (error) {
        console.error('API health check failed:', error)
        setApiStatus('error')
      }
    }
    checkApiHealth()
  }, [])

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

      // Check if response is ok
      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          errorData = { error: `Server error: ${response.status} ${response.statusText}` }
        }
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
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      // Provide more helpful error messages
      let errorMessage = 'Connection error'
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        errorMessage = 'Network error: Unable to reach the API server.\n\nPossible causes:\n• API not deployed or function not found\n• CORS configuration issue\n• Network connectivity problem\n\nCheck Vercel dashboard → Functions tab for errors.'
      } else if (error.message && error.message.includes('API key')) {
        errorMessage = 'OpenAI API key is not configured.\n\nPlease:\n1. Go to Vercel Dashboard → Settings → Environment Variables\n2. Add OPENAI_API_KEY with your API key\n3. Redeploy the project'
      } else if (error.message) {
        errorMessage = error.message
      } else {
        errorMessage = 'Connection error. Please check:\n1. API is deployed and running\n2. OPENAI_API_KEY is set in Vercel environment variables\n3. Check Vercel function logs for details'
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Error: ${errorMessage}\n\n💡 Debug: Open browser console (F12) and check:\n• Network tab for failed requests\n• Console tab for error details\n• Vercel Functions tab for server logs` 
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
