# Simple Video Maker

A modern web application for creating videos from images and video clips with background audio. Built with React, TypeScript, FastAPI, and FFmpeg.

## Features

- **Media Upload**: Upload multiple images (JPG, PNG, WebP) and video clips (MP4, MOV, WebM)
- **Timeline Editor**: Drag-and-drop to reorder media, set image durations
- **Background Audio**: Add background audio tracks with volume control, fade effects, and looping
- **Video Preview**: Real-time browser preview with muted video audio
- **Export Options**: Multiple formats (MP4, WebM, MOV), resolutions (480p to 1440p), aspect ratios
- **Server-Side Rendering**: FFmpeg-powered video generation with proper audio isolation

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- @hello-pangea/dnd for drag-and-drop

### Backend
- FastAPI (Python 3.11+)
- FFmpeg for media processing
- FFprobe for media inspection
- Async file handling with aiofiles

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- FFmpeg installed and accessible in PATH
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy the example environment file:
```bash
cp .env.example .env
```

5. Ensure FFmpeg is installed:
```bash
ffmpeg -version
ffprobe -version
```

If FFmpeg is not installed:
- **Ubuntu/Debian**: `sudo apt-get install ffmpeg`
- **macOS**: `brew install ffmpeg`
- **Windows**:
  1. Download from https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
  2. Extract to a folder (e.g., C:\ffmpeg)
  3. Add C:\ffmpeg\bin to your system PATH
  4. Restart your terminal and verify with `ffmpeg -version`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Start the Backend

From the backend directory:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Start the Frontend

From the frontend directory:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Docker Setup

### Using Docker Compose

1. Build and start the services:
```bash
docker-compose up --build
```

2. The backend will be available at `http://localhost:8000`

3. Start the frontend separately (as shown above) or add a frontend service to docker-compose.yml

## API Documentation

Once the backend is running, visit:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Key Endpoints

- `POST /api/projects` - Create a new project
- `GET /api/projects/{project_id}` - Get project details
- `PATCH /api/projects/{project_id}` - Update project settings
- `POST /api/projects/{project_id}/media` - Upload media files
- `DELETE /api/projects/{project_id}/media/{media_id}` - Remove media
- `POST /api/projects/{project_id}/audio` - Upload background audio
- `DELETE /api/projects/{project_id}/audio` - Remove audio
- `POST /api/renders` - Start video rendering
- `GET /api/renders/{render_id}` - Get render status
- `POST /api/renders/{render_id}/cancel` - Cancel rendering
- `GET /api/renders/{render_id}/download` - Download completed video

## Usage Workflow

1. **Create Project**: The app automatically creates a new project on load
2. **Upload Media**: Drag and drop images/videos or click to browse
3. **Arrange Timeline**: Drag items to reorder, set image durations
4. **Add Audio**: Upload a background audio track (optional)
5. **Configure Settings**: Choose aspect ratio, resolution, format, quality
6. **Preview**: Use the preview panel to review your project
7. **Render**: Click "Create Video" to generate the final video
8. **Download**: Once rendering completes, download your video

## Audio Isolation

**Critical Feature**: The application automatically mutes all original audio from uploaded video clips. Only the selected background audio track (if any) will be audible in the final video.

This is implemented in the FFmpeg rendering pipeline by:
- Processing video clips with the `-an` flag to remove audio streams
- Adding the background audio only in the final rendering stage
- Validating output to ensure no unintended audio streams exist

## Testing

### Backend Tests

From the backend directory:
```bash
pytest test_api.py -v
```

### Manual Testing Checklist

- [ ] Upload multiple images and verify they appear in timeline
- [ ] Upload video clips and verify they appear with correct type
- [ ] Drag and drop to reorder timeline items
- [ ] Change image durations and verify they persist
- [ ] Upload background audio and preview it
- [ ] Adjust audio volume and fade settings
- [ ] Preview the project with muted video audio
- [ ] Render a video with images only
- [ ] Render a video with video clips only (verify no original audio)
- [ ] Render a video with mixed media
- [ ] Render with background audio (verify only background audio is present)
- [ ] Try different aspect ratios and resolutions
- [ ] Try different export formats
- [ ] Cancel a render in progress
- [ ] Download completed video

## Configuration

Edit `backend/.env` to customize:

- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 8000)
- `CORS_ORIGINS` - Allowed frontend origins
- `MAX_UPLOAD_SIZE` - Maximum file size in bytes (default: 500MB)
- `MAX_PROJECT_FILES` - Maximum files per project (default: 50)
- `MAX_RENDER_JOBS` - Concurrent render jobs (default: 3)
- `RENDER_TIMEOUT` - Render timeout in seconds (default: 600)

## Troubleshooting

### FFmpeg Not Found
- Ensure FFmpeg is installed and in your system PATH
- On Windows, add FFmpeg to your PATH environment variable
- Update `FFMPEG_PATH` and `FFPROBE_PATH` in `.env` if using custom paths

### Upload Fails
- Check file size against `MAX_UPLOAD_SIZE`
- Verify file type is supported
- Check backend logs for specific error messages

### Render Fails
- Ensure all media files are valid and not corrupted
- Check FFmpeg is working by running `ffmpeg -version`
- Review backend logs for FFmpeg error output
- Verify sufficient disk space in temp and output directories

### Frontend Can't Connect to Backend
- Ensure backend is running on port 8000
- Check CORS settings in `.env`
- Verify `API_BASE` in `frontend/src/api.ts` matches backend URL

## Known Limitations

- Video clip trimming (start/end points) is configured but not fully implemented in the UI
- Crossfade transitions are defined but may not work reliably in all cases
- Blurred background image display mode is configured but not implemented
- Real-time preview may not perfectly match server-rendered output
- No persistent project storage (projects are lost on server restart)
- No user authentication or multi-user support

## Production Deployment

For production deployment:

1. **Use a proper database** (PostgreSQL) instead of in-memory storage
2. **Use object storage** (S3, GCS) instead of local filesystem
3. **Add authentication** (JWT, OAuth) for user accounts
4. **Implement a job queue** (Celery, Redis) for render workers
5. **Add rate limiting** to prevent abuse
6. **Use HTTPS** with proper SSL certificates
7. **Set up monitoring** (Prometheus, Grafana)
8. **Configure auto-scaling** for render workers
9. **Implement cleanup jobs** for expired files
10. **Add backup and recovery** procedures

## License

This project is provided as-is for educational and personal use.

## Support

For issues or questions, please check the troubleshooting section or review the API documentation at `/docs`.
