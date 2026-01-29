// Vercel serverless function - handles all API routes
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import pdfParse from 'pdf-parse'
import OpenAI from 'openai'
import fs from 'fs'

const app = express()

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Middleware
app.use(cors())
app.use(express.json())

// Create uploads directory if it doesn't exist (for serverless, use /tmp)
const uploadsDir = '/tmp/uploads'
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const isPDF = file.mimetype === 'application/pdf' || 
                  file.mimetype === 'application/x-pdf' ||
                  file.originalname.toLowerCase().endsWith('.pdf')
    
    if (isPDF) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed. Received: ' + file.mimetype))
    }
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Upload endpoint
app.post('/api/upload', upload.single('resume'), async (req, res) => {
  let filePath = null
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please select a PDF file.' })
    }

    filePath = req.file.path
    const dataBuffer = fs.readFileSync(filePath)
    
    // Parse PDF
    const pdfData = await pdfParse(dataBuffer)
    const text = pdfData.text.trim()

    if (!text || text.length === 0) {
      throw new Error('No text could be extracted from the PDF. The PDF might be image-based or corrupted.')
    }

    // Clean up file after parsing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    res.json({ text })
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath)
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError)
      }
    }

    res.status(500).json({ 
      error: error.message || 'Failed to process resume'
    })
  }
})

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, resumeText, conversationHistory } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    if (!resumeText) {
      return res.status(400).json({ error: 'No resume uploaded. Please upload a resume first.' })
    }

    // Build conversation context
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant that answers questions about resumes. The user has uploaded a resume, and you should answer questions based on the information in that resume. Here is the resume content:

${resumeText}

Answer questions about this resume accurately and helpfully. If the information is not in the resume, say so.`
    }

    // Format conversation history for OpenAI
    const messages = [systemMessage]
    
    // Add recent conversation history (last 10 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-10)
    recentHistory.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      }
    })

    // Add current message
    messages.push({
      role: 'user',
      content: message
    })

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0].message.content

    res.json({ response })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to get response from AI' 
    })
  }
})

// Export as Vercel serverless function
export default app
