import express from 'express'
import cors from 'cors'
import multer from 'multer'
import pdfParse from 'pdf-parse'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from project root
const envPath = path.join(__dirname, '..', '.env')
console.log('Loading .env from:', envPath)

const result = dotenv.config({ path: envPath })

if (result.error) {
  console.error('❌ ERROR loading .env file:', result.error.message)
  console.error(`   Expected location: ${envPath}`)
  console.error('   Please create a .env file with your OPENAI_API_KEY')
  process.exit(1)
}

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env file not found!')
  console.error(`   Expected location: ${envPath}`)
  console.error('   Please create a .env file with your OPENAI_API_KEY')
  process.exit(1)
}

const app = express()
const port = 5000

// Check if API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY is not set in .env file!')
  console.error('   Please add: OPENAI_API_KEY=your_api_key_here')
  process.exit(1)
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

console.log('✅ OpenAI API key loaded successfully')

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
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
    // Accept PDF files - check both MIME type and file extension
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

// Upload endpoint
app.post('/api/upload', upload.single('resume'), async (req, res) => {
  let filePath = null
  try {
    console.log('Upload request received')
    console.log('Request file:', req.file)
    console.log('Request body:', req.body)

    if (!req.file) {
      console.error('No file in request')
      return res.status(400).json({ error: 'No file uploaded. Please select a PDF file.' })
    }

    filePath = req.file.path
    console.log('File saved to:', filePath)
    console.log('File size:', req.file.size, 'bytes')

    const dataBuffer = fs.readFileSync(filePath)
    console.log('File read, buffer size:', dataBuffer.length)
    
    // Parse PDF
    console.log('Parsing PDF...')
    const pdfData = await pdfParse(dataBuffer)
    const text = pdfData.text.trim()

    console.log('PDF parsed successfully')
    console.log('Extracted text length:', text.length)
    console.log('First 100 chars:', text.substring(0, 100))

    if (!text || text.length === 0) {
      throw new Error('No text could be extracted from the PDF. The PDF might be image-based or corrupted.')
    }

    // Clean up file after parsing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log('Temporary file deleted')
    }

    res.json({ text })
  } catch (error) {
    console.error('Upload error:', error)
    console.error('Error stack:', error.stack)
    
    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath)
        console.log('Cleaned up temporary file after error')
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError)
      }
    }

    const errorMessage = error.message || 'Failed to process resume'
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

const server = app.listen(port, () => {
  console.log('='.repeat(50))
  console.log(`✅ Resume Chatbot Backend Server`)
  console.log(`   Running on http://localhost:${port}`)
  console.log(`   Health check: http://localhost:${port}/api/health`)
  console.log('='.repeat(50))
  console.log('')
  console.log('Server is ready! You can now upload resumes.')
  console.log('Press Ctrl+C to stop the server.')
  console.log('')
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('')
    console.error('❌ ERROR: Port 5000 is already in use!')
    console.error('')
    console.error('To fix this, run one of these commands:')
    console.error('')
    console.error('  Option 1: Kill the process using port 5000')
    console.error('    kill -9 $(lsof -ti:5000)')
    console.error('')
    console.error('  Option 2: Use the helper script')
    console.error('    ./kill-server.sh')
    console.error('')
    console.error('  Option 3: Find what\'s using the port')
    console.error('    lsof -i:5000')
    console.error('')
    console.error('After killing the process, run "npm run server" again.')
    console.error('')
    process.exit(1)
  } else {
    console.error('Server error:', error)
    process.exit(1)
  }
})
