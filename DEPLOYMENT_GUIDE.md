# Deployment Guide - Simple Video Maker

This guide will walk you through deploying the Simple Video Maker application to production using:
- **Vercel** for the frontend (React application)
- **Render** for the backend (FastAPI application)

## Prerequisites

1. A GitHub account with the repository: https://github.com/devstephenke-sys/Simple-Online-Video-Maker
2. A Vercel account (free)
3. A Render account (free tier available)

---

## Step 1: Deploy Backend to Render

### Why Render First?
The backend must be deployed first because the frontend needs the backend URL to connect to it.

### 1.1 Create a Render Account

1. Go to https://render.com
2. Click "Sign Up" and sign up with GitHub
3. Verify your email if required

### 1.2 Create a New Web Service

1. After logging in, click "New +" in the top right
2. Select "Web Service"

### 1.3 Connect Your GitHub Repository

1. Render will ask to connect to your GitHub account
2. Authorize Render to access your repositories
3. Find and select `Simple-Online-Video-Maker` from the list
4. Click "Connect"

### 1.4 Configure the Web Service

**Name**: `simple-video-maker-backend`

**Region**: Choose the region closest to your users (e.g., Oregon, Frankfurt, Singapore)

**Branch**: `master`

**Root Directory**: `backend`

**Runtime**: `Python 3`

**Build Command**: `pip install -r requirements.txt`

**Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 1.5 Configure Environment Variables

Scroll down to "Environment Variables" and add the following:

| Key | Value |
|-----|-------|
| `PORT` | `8000` |
| `HOST` | `0.0.0.0` |
| `CORS_ORIGINS` | `https://simple-online-video-maker.vercel.app,http://localhost:5173` |
| `UPLOAD_DIR` | `./uploads` |
| `TEMP_DIR` | `./temp` |
| `OUTPUT_DIR` | `./output` |
| `MAX_UPLOAD_SIZE` | `524288000` |
| `MAX_PROJECT_FILES` | `50` |
| `FFMPEG_PATH` | `ffmpeg` |
| `FFPROBE_PATH` | `ffprobe` |
| `MAX_RENDER_JOBS` | `3` |
| `RENDER_TIMEOUT` | `600` |
| `TEMP_FILE_RETENTION` | `3600` |
| `OUTPUT_FILE_RETENTION` | `86400` |

**Important**: The `CORS_ORIGINS` must include your Vercel frontend URL to allow the frontend to communicate with the backend. If your Vercel URL is different, update it accordingly.

### 1.6 Select a Plan

Choose the **Free** plan for testing (this has limitations but is sufficient for initial testing).

### 1.7 Deploy

Click "Create Web Service" at the bottom.

Render will now:
1. Clone your repository
2. Install dependencies
3. Start the application

This may take 2-5 minutes. You'll see logs in the "Events" tab.

### 1.8 Note Your Backend URL

Once deployment is successful, you'll see a URL like:
```
https://simple-video-maker-backend.onrender.com
```

**Copy this URL** - you'll need it for the frontend deployment.

### 1.9 Verify Backend is Working

1. Visit your backend URL followed by `/docs`
   - Example: `https://simple-video-maker-backend.onrender.com/docs`
2. You should see the FastAPI interactive documentation
3. Try visiting `/health` to verify it's responding

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create a Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up" and sign up with GitHub
3. Verify your email if required

### 2.2 Import Your Project

1. After logging in, click "Add New..." → "Project"
2. Vercel will show your GitHub repositories
3. Find and select `Simple-Online-Video-Maker`
4. Click "Import"

### 2.3 Configure the Project

**Project Name**: `simple-video-maker` (or any name you prefer)

**Framework Preset**: Vite should be auto-detected

**Root Directory**: `frontend`

**Build Command**: `npm run build`

**Output Directory**: `dist`

**Install Command**: `npm install`

### 2.4 Configure Environment Variables

Scroll down to "Environment Variables" and add:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://simple-online-video-maker.onrender.com/api` |

**Important**: This value must match your actual Render backend URL. If your backend URL is different, replace it accordingly.

### 2.5 Deploy

Click "Deploy".

Vercel will:
1. Clone your repository
2. Install dependencies
3. Build the frontend
4. Deploy to edge network

This usually takes 1-2 minutes.

### 2.6 Note Your Frontend URL

Once deployed, Vercel will provide a URL like:
```
https://simple-video-maker.vercel.app
```

### 2.7 Update Backend CORS

Go back to your Render dashboard:

1. Navigate to your backend service
2. Click "Environment" in the left sidebar
3. Find the `CORS_ORIGINS` variable
4. Update it to include your Vercel URL:
   ```
   https://simple-video-maker.vercel.app,http://localhost:5173
   ```
5. Click "Save Changes"
6. Render will automatically redeploy with the new configuration

### 2.8 Update Vercel Rewrite (Optional)

If you prefer to use Vercel's rewrite feature instead of environment variables:

1. Edit `frontend/vercel.json` in your repository
2. Replace `https://your-backend-url.onrender.com` with your actual backend URL
3. Commit and push the changes
4. Vercel will automatically redeploy

---

## Step 3: Verify the Deployment

### 3.1 Test the Frontend

1. Visit your Vercel URL
2. You should see the Simple Video Maker interface
3. Try uploading an image
4. Check browser console (F12) for any errors

### 3.2 Test API Connection

1. Open browser DevTools (F12)
2. Go to the Network tab
3. Try uploading media in the app
4. You should see API requests to your Render backend
5. Check that requests succeed (status 200)

### 3.3 Test End-to-End

1. Upload a few images
2. Arrange them in the timeline
3. Add background audio (optional)
4. Configure settings
5. Preview the project
6. Click "Create Video"
7. Wait for rendering
8. Download the video

---

## Step 4: Important Notes

### 4.1 Render Free Tier Limitations

The Render free tier has these limitations:
- **Sleeps after 15 minutes of inactivity**: Your backend will go to sleep if not used
- **Cold starts**: First request after sleep may take 30-60 seconds
- **512 MB RAM**: May not be sufficient for large video renders
- **No persistent storage**: Files are lost when the service restarts

For production use, consider upgrading to a paid plan or using:
- A disk-based storage solution
- AWS S3 or similar for file storage
- A proper database instead of in-memory storage

### 4.2 Vercel Free Tier

Vercel's free tier is very generous and suitable for this frontend:
- Unlimited deployments
- 100 GB bandwidth per month
- Automatic HTTPS
- Global CDN

### 4.3 File Storage Considerations

Currently, the application uses local filesystem storage which doesn't persist across deployments. For production:

**Option 1: Use Render Disk**
- Upgrade to Render paid plan
- Add a disk to your service
- Mount it to your storage directories

**Option 2: Use Cloud Storage**
- Integrate AWS S3, Google Cloud Storage, or Wasabi
- Store uploaded files in object storage
- Update the code to use the storage SDK

**Option 3: Use Temporary Storage Only**
- Accept that files are temporary
- Add download URLs with expiration
- Inform users that projects are session-based

### 4.4 FFmpeg on Render

Render's free tier includes FFmpeg, but:
- Processing may be slower on free tier
- Large video renders may timeout
- Consider upgrading for production use

---

## Step 5: Troubleshooting

### Backend Won't Start

**Issue**: Deployment fails with build errors

**Solution**:
1. Check Render logs in the "Events" tab
2. Ensure all dependencies are in `requirements.txt`
3. Verify Python version compatibility
4. Check that FFmpeg is available (Render includes it by default)

### CORS Errors

**Issue**: Frontend can't connect to backend

**Solution**:
1. Verify `CORS_ORIGINS` includes your Vercel URL
2. Check that the URL has no trailing slashes
3. Ensure the backend is deployed and running
4. Check browser console for specific CORS error messages

### File Upload Fails

**Issue**: Uploads fail with errors

**Solution**:
1. Check file size against `MAX_UPLOAD_SIZE`
2. Verify file type is supported
3. Check Render logs for error details
4. Ensure sufficient disk space on Render

### Render Timeouts

**Issue**: Video rendering times out

**Solution**:
1. Increase `RENDER_TIMEOUT` in environment variables
2. Reduce video resolution or quality
3. Use shorter video clips
4. Upgrade to a paid Render plan with more resources

### Frontend Build Fails

**Issue**: Vercel deployment fails

**Solution**:
1. Check Vercel build logs
2. Ensure `package.json` is correct
3. Verify all dependencies are installable
4. Check TypeScript errors

---

## Step 6: Updating the Application

### To Update the Backend

1. Make changes to your code
2. Commit and push to GitHub
3. Render will automatically detect and redeploy
4. Monitor the deployment in Render dashboard

### To Update the Frontend

1. Make changes to your code
2. Commit and push to GitHub
3. Vercel will automatically detect and redeploy
4. Monitor the deployment in Vercel dashboard

### To Update Both

1. Commit and push all changes
2. Both services will auto-deploy
3. Backend updates first, then frontend

---

## Step 7: Production Recommendations

For a production-ready deployment, consider:

1. **Upgrade to Paid Plans**
   - Render Starter plan ($7/month) for better performance
   - Vercel Pro plan ($20/month) for more features

2. **Add Authentication**
   - Implement user accounts
   - Add JWT or OAuth authentication
   - Secure all endpoints

3. **Use a Database**
   - Replace in-memory storage with PostgreSQL
   - Render offers managed PostgreSQL
   - Or use Supabase, Neon, or PlanetScale

4. **Use Object Storage**
   - AWS S3, Google Cloud Storage, or Wasabi
   - More reliable than local filesystem
   - Better for scaling

5. **Add Monitoring**
   - Render includes basic monitoring
   - Add error tracking (Sentry)
   - Set up uptime monitoring

6. **Add Rate Limiting**
   - Prevent abuse
   - Protect your API
   - Use middleware or services

7. **Implement File Cleanup**
   - Delete old temporary files
   - Expire download links
   - Automate with cron jobs

---

## Summary

Your deployment architecture:

```
User → Vercel (Frontend) → Render (Backend) → FFmpeg
                                      ↓
                               Local Storage
```

**Frontend (Vercel)**:
- URL: `https://your-app.vercel.app`
- Static React application
- Served from global CDN

**Backend (Render)**:
- URL: `https://your-backend.onrender.com`
- FastAPI application
- Handles video processing with FFmpeg

**Communication**:
- Frontend calls backend via API
- CORS configured to allow requests
- Environment variables for configuration

---

## Need Help?

- **Render Documentation**: https://render.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **GitHub Repository**: https://github.com/devstephenke-sys/Simple-Online-Video-Maker
- **Project README**: See README.md in the repository
