# Resume Chatbot

A React-based chatbot application that allows users to upload resumes and ask questions about them using OpenAI's GPT-4.

## Features

- 📄 Upload PDF resumes
- 💬 Ask questions about uploaded resumes
- 🤖 Powered by OpenAI GPT-4
- 🎨 Modern, responsive UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

4. In a separate terminal, start the backend server:
```bash
npm run server
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click "Upload Resume" to upload a PDF resume
2. Once uploaded, you can ask questions about the resume
3. The chatbot will answer based on the content of the uploaded resume

## Project Structure

```
chatbot/
├── src/
│   ├── components/
│   │   ├── ChatMessage.jsx
│   │   └── ResumeUpload.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── server/
│   └── index.js
├── .env
├── package.json
└── vite.config.js
```

## Technologies Used

- React 18
- Vite
- Express.js
- OpenAI API (GPT-4)
- Multer (file uploads)
- pdf-parse (PDF text extraction)

## Important Security Note

⚠️ **Never commit your `.env` file or API keys to git!** The `.env` file is already in `.gitignore` to prevent accidental commits.
