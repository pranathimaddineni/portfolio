# Quick Fix for "Connection error" on Vercel

## Step 1: Verify Environment Variable (MOST COMMON ISSUE)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Check if `OPENAI_API_KEY` exists
5. If it doesn't exist:
   - Click **Add New**
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (starts with `sk-proj-...`)
   - Select all environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

## Step 2: Redeploy

After adding/updating the environment variable:
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## Step 3: Test the API

Open your browser and go to:
```
https://your-project.vercel.app/api/health
```

You should see:
```json
{"status":"ok","message":"Server is running","hasApiKey":true}
```

**If `hasApiKey` is `false`**, the environment variable is not set correctly.

## Step 4: Check Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Functions** tab
3. Click on any `/api/chat` request
4. Check the logs for errors

Common errors you might see:
- `OPENAI_API_KEY is not set` → Environment variable missing
- `Function timeout` → Request took too long (increase timeout in vercel.json)
- `APIError: Invalid API key` → API key is incorrect

## Step 5: Check Browser Console

1. Open your deployed site
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try asking a question
5. Check for error messages

## Step 6: Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try asking a question
4. Look for `/api/chat` request
5. Click on it to see:
   - **Status Code** (should be 200)
   - **Response** (should show the error if any)

## Still Not Working?

1. **Verify API key is correct**: Make sure there are no extra spaces
2. **Check API key is active**: Test it at https://platform.openai.com/api-keys
3. **Check Vercel logs**: Functions tab → View logs for detailed errors
4. **Try redeploying**: Sometimes a fresh deploy fixes issues

## Common Issues:

### Issue: "Network error: Unable to reach the API"
- **Cause**: Function not deployed or route not found
- **Fix**: Check Vercel Functions tab to see if `/api/chat` exists

### Issue: "OpenAI API key is not configured"
- **Cause**: Environment variable not set
- **Fix**: Follow Step 1 above

### Issue: "Function timeout"
- **Cause**: Request taking too long
- **Fix**: Already set to 30 seconds in vercel.json, but you can increase it

### Issue: CORS errors
- **Cause**: CORS configuration issue
- **Fix**: Already configured in vercel.json, but check if headers are correct
