# Troubleshooting Resume Upload Issues

## Common Issues and Solutions

### 1. "Server not connected" Warning

**Problem**: The upload button shows a warning that the server is not connected.

**Solution**:
- Make sure the backend server is running: `npm run server`
- Check that the server is running on port 5000
- Verify you see: `Server running on http://localhost:5000` in the terminal

### 2. Upload Fails with Network Error

**Problem**: Getting "Network error" or "Failed to fetch" errors.

**Solutions**:
- Ensure both servers are running:
  - Backend: `npm run server` (port 5000)
  - Frontend: `npm run dev` (port 3000)
- Check browser console (F12) for detailed error messages
- Verify the Vite proxy is working by checking `vite.config.js`

### 3. "No text could be extracted" Error

**Problem**: Upload succeeds but shows error about no text extracted.

**Solutions**:
- The PDF might be image-based (scanned document). Try a PDF with selectable text
- The PDF might be corrupted. Try opening it in a PDF viewer first
- The PDF might be password-protected. Remove password protection
- Try a different PDF file to test

### 4. File Upload Button Not Working

**Problem**: Clicking upload button does nothing.

**Solutions**:
- Check browser console for JavaScript errors
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Try refreshing the page
- Clear browser cache

### 5. CORS Errors

**Problem**: Seeing CORS (Cross-Origin Resource Sharing) errors in console.

**Solutions**:
- Make sure the backend server has CORS enabled (it should be in `server/index.js`)
- Verify the frontend is accessing `http://localhost:3000` and backend is on `http://localhost:5000`
- Don't access the frontend via `file://` protocol - use `http://localhost:3000`

### 6. File Size Too Large

**Problem**: Error about file size limit.

**Solution**:
- The limit is 10MB. Compress your PDF or use a smaller file
- You can increase the limit in `server/index.js` (line 47)

## Debugging Steps

1. **Check Backend Logs**: Look at the terminal where you ran `npm run server`
   - You should see detailed logs about file uploads
   - Look for error messages

2. **Check Browser Console**: Press F12 in your browser
   - Look for errors in the Console tab
   - Check the Network tab to see if requests are being made

3. **Test Server Health**: Open `http://localhost:5000/api/health` in your browser
   - Should return: `{"status":"ok","message":"Server is running"}`

4. **Verify File Format**: 
   - Make sure you're uploading a `.pdf` file
   - Try with a simple PDF first to test

5. **Check Dependencies**:
   ```bash
   npm list pdf-parse multer express
   ```
   - All should be installed

## Still Not Working?

1. Restart both servers (stop with Ctrl+C, then restart)
2. Clear browser cache
3. Try a different PDF file
4. Check that Node.js version is 16 or higher: `node --version`
5. Reinstall dependencies: `rm -rf node_modules && npm install`
