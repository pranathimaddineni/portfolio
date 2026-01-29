# Deploy to Vercel

## Quick Deploy Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import your repository**:
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `pranathimaddineni/portfolio`
   - Click "Import"

3. **Configure Project**:
   - Framework Preset: **Vite** (should auto-detect)
   - Root Directory: **./** (leave as is)
   - Build Command: `npm run build` (should auto-detect)
   - Output Directory: `dist` (should auto-detect)
   - Install Command: `npm install`

4. **Add Environment Variables** (IMPORTANT!):
   - Go to Project Settings → Environment Variables
   - Click "Add New"
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (from your `.env` file)
   - Make sure to add it for **Production**, **Preview**, and **Development**
   - Click "Save"

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (usually 2-3 minutes)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (for first time)
   - Project name: **portfolio** (or your preferred name)
   - Directory: **./** (current directory)
   - Override settings? **No**

4. **Add Environment Variables**:
   ```bash
   vercel env add OPENAI_API_KEY
   ```
   Paste your OpenAI API key when prompted.

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Important Notes

### Environment Variables
Make sure to add your `OPENAI_API_KEY` in Vercel dashboard:
- Settings → Environment Variables
- Add `OPENAI_API_KEY` with your actual key
- Apply to: Production, Preview, Development

### API Routes
The API routes are configured to work with Vercel serverless functions:
- `/api/upload` - Resume upload endpoint
- `/api/chat` - Chat endpoint
- `/api/health` - Health check endpoint

### File Uploads
File uploads use `/tmp` directory in serverless environment (Vercel automatically provides this).

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure `vercel-build` script exists
- Check Vercel build logs for errors

### API Routes Not Working
- Verify environment variables are set correctly
- Check that `api/index.js` exists
- Ensure `vercel.json` is configured correctly

### File Upload Issues
- Vercel serverless functions have a 10MB limit for request body
- Files are stored in `/tmp` which is ephemeral (cleaned after function execution)

## Post-Deployment

After deployment, your app will be available at:
- Production: `https://your-project-name.vercel.app`
- Preview: `https://your-project-name-git-branch.vercel.app`

Update your frontend API calls if needed (Vercel automatically handles `/api` routes).
