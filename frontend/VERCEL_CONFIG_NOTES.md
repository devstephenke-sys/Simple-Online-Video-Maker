# Vercel Configuration Notes

## API Routing

The frontend currently has two ways to connect to the backend API:

### 1. Environment Variable (Recommended for Production)
Set `VITE_API_BASE_URL` in Vercel environment variables:
- Key: `VITE_API_BASE_URL`
- Value: `https://simple-online-video-maker.onrender.com/api`

This is the recommended approach for production deployments as it's explicit and reliable.

### 2. Rewrite Rule (vercel.json)
The `vercel.json` file contains a rewrite rule that proxies `/api/*` requests to the Render backend. This is a fallback mechanism but may not work in all cases.

**Important:** The environment variable approach takes precedence over the rewrite rule. Always use the environment variable for production deployments.

## Configuration Status

- ✅ Backend CORS includes Vercel URL: `https://simple-online-video-maker.vercel.app`
- ✅ Frontend API config uses environment variable with fallback to `/api`
- ✅ Deployment guide updated with actual backend URL
