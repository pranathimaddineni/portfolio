# Vercel Deployment Troubleshooting

## "Connection error" After Deployment

### Step 1: Verify Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Verify that `OPENAI_API_KEY` is set with your actual API key
4. Make sure it's enabled for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

### Step 2: Check Function Logs

1. Go to your Vercel project dashboard
2. Click on **Functions** tab
3. Click on any failed request to see the logs
4. Look for errors like:
   - "OPENAI_API_KEY is not set"
   - "Function timeout"
   - Any other error messages

### Step 3: Test the API Endpoint Directly

Test the health endpoint:
```
https://your-project.vercel.app/api/health
```

Should return:
```json
{"status":"ok","message":"Server is running","hasApiKey":true}
```

If `hasApiKey` is `false`, your environment variable is not set correctly.

### Step 4: Common Issues

#### Issue: Environment Variable Not Set
**Solution:**
- Go to Vercel Dashboard → Settings → Environment Variables
- Add `OPENAI_API_KEY` with your key
- Redeploy the project

#### Issue: Function Timeout
**Solution:**
- The function timeout is set to 30 seconds in `vercel.json`
- If OpenAI API calls are slow, this might timeout
- Check Vercel logs for timeout errors

#### Issue: CORS Errors
**Solution:**
- CORS is already configured in the API
- Check browser console for CORS errors
- The `vercel.json` has CORS headers configured

#### Issue: API Key Invalid
**Solution:**
- Verify your OpenAI API key is correct
- Check if the key has expired or been revoked
- Make sure there are no extra spaces in the environment variable

### Step 5: Redeploy After Fixes

After fixing environment variables:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger redeployment

### Step 6: Test in Browser Console

Open browser console (F12) and check:
1. Network tab - see if `/api/chat` requests are being made
2. Console tab - look for error messages
3. Check the response status and error details

### Debugging Commands

Test the API from terminal:
```bash
# Test health endpoint
curl https://your-project.vercel.app/api/health

# Test chat endpoint (after uploading resume)
curl -X POST https://your-project.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","resumeText":"test resume","conversationHistory":[]}'
```

## Still Not Working?

1. Check Vercel function logs for detailed error messages
2. Verify the API key is correct and active
3. Make sure you've redeployed after adding environment variables
4. Check browser console for specific error messages
5. Test the health endpoint first to verify the API is working
