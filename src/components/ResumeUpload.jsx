import { useState, useEffect } from 'react'
import './ResumeUpload.css'

function ResumeUpload({ onUpload }) {
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [serverStatus, setServerStatus] = useState('checking')

  // Check if server is running
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Server health check passed:', data)
          setServerStatus('online')
        } else {
          console.error('Server health check failed with status:', response.status)
          setServerStatus('error')
        }
      } catch (error) {
        console.error('Server health check failed:', error)
        console.error('Make sure the backend server is running: npm run server')
        setServerStatus('error')
      }
    }
    
    // Check immediately
    checkServer()
    
    // Check every 5 seconds to update status
    const interval = setInterval(checkServer, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check if file is PDF
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file')
      e.target.value = '' // Reset input
      return
    }

    setIsUploading(true)
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      console.log('Uploading file:', file.name, 'Size:', file.size)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('Upload response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Upload successful, text length:', data.text?.length)

      if (data.text && data.text.trim().length > 0) {
        onUpload(data.text)
      } else {
        throw new Error('Resume uploaded but no text could be extracted. Please ensure the PDF contains readable text.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Error uploading resume: ${error.message}\n\nPlease check:\n1. The backend server is running (npm run server)\n2. The file is a valid PDF\n3. The PDF contains readable text`)
      setFileName('')
      e.target.value = '' // Reset input
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="resume-upload">
      {serverStatus === 'error' && (
        <span 
          style={{ 
            color: '#ff6b6b', 
            fontSize: '12px', 
            marginRight: '10px',
            display: 'block',
            marginBottom: '5px'
          }}
          title="Make sure to run 'npm run server' in a separate terminal"
        >
          ⚠ Server not connected - Run 'npm run server' in Terminal
        </span>
      )}
      {serverStatus === 'checking' && (
        <span style={{ color: '#ffa500', fontSize: '12px', marginRight: '10px' }}>
          Checking server...
        </span>
      )}
      <label 
        htmlFor="resume-upload-input" 
        className={`upload-button ${serverStatus === 'error' ? 'disabled' : ''}`}
        style={{ opacity: serverStatus === 'error' ? 0.6 : 1 }}
      >
        {isUploading ? 'Uploading...' : fileName ? `✓ ${fileName}` : 'Upload Resume'}
      </label>
      <input
        id="resume-upload-input"
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        disabled={isUploading || serverStatus === 'error'}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default ResumeUpload
