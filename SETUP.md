# Setup Guide for Simple Video Maker

## Quick Start

### 1. Install FFmpeg (Required)

**Windows:**
1. Download FFmpeg from https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your system PATH:
   - Right-click "This PC" → Properties → Advanced system settings
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add `C:\ffmpeg\bin`
   - Click OK on all dialogs
4. Restart your terminal/command prompt
5. Verify installation: `ffmpeg -version`

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Start the backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install

# Start the frontend
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Testing the Application

### Manual Test Workflow

1. **Open the application** in your browser at http://localhost:5173

2. **Upload media**:
   - Click the upload area or drag and drop images/videos
   - Try uploading a few images (JPG, PNG)
   - Try uploading a video clip (MP4)

3. **Arrange timeline**:
   - Drag items to reorder them
   - Change image durations using the dropdown
   - Remove items using the trash icon

4. **Add audio** (optional):
   - Click "Add Background Audio"
   - Upload an MP3 or WAV file
   - Adjust volume slider
   - Test fade in/out options
   - Preview the audio

5. **Configure settings**:
   - Change aspect ratio (16:9, 9:16, 1:1, 4:3)
   - Select resolution (480p, 720p, 1080p, 1440p)
   - Choose frame rate (24, 25, 30 FPS)
   - Select format (MP4, WebM, MOV)
   - Set quality (Standard, High, Best)

6. **Preview**:
   - Click on timeline items to preview
   - Use play/pause controls
   - Navigate with previous/next buttons
   - Verify video audio is muted

7. **Render video**:
   - Click "Create Video"
   - Watch the progress modal
   - Wait for completion
   - Download the video

8. **Verify output**:
   - Play the downloaded video
   - Check that images appear in correct order
   - Verify video clips are in sequence
   - **CRITICAL**: Confirm no original video audio is present
   - Verify only background audio (if added) is audible

### Running Backend Tests

From the backend directory (with virtual environment activated):

```bash
pytest test_api.py -v
```

## Troubleshooting

### "FFmpeg not found" error
- Ensure FFmpeg is installed and in your PATH
- Restart your terminal after adding FFmpeg to PATH
- Verify with `ffmpeg -version` in your terminal

### Backend won't start
- Check if port 8000 is already in use
- Try a different port: `uvicorn main:app --port 8001`
- Check Python version (requires 3.11+)

### Frontend can't connect to backend
- Ensure backend is running
- Check browser console for CORS errors
- Verify CORS_ORIGINS in backend/.env includes your frontend URL

### Upload fails
- Check file size (max 500MB by default)
- Verify file format is supported
- Check backend logs for specific errors

### Render fails
- Ensure all media files are valid
- Check FFmpeg is working: `ffmpeg -version`
- Review backend console for FFmpeg errors
- Verify sufficient disk space

### Video has no audio
- This is expected if no background audio was uploaded
- The final video should be silent (no original video audio)

### Video has wrong audio
- If you hear original video audio, this is a bug
- Report this immediately as it violates the audio isolation requirement

## Docker Alternative

If you prefer Docker:

```bash
docker-compose up --build
```

Then start the frontend separately as shown above.

Note: The Docker image includes FFmpeg, so you don't need to install it separately.

## Next Steps

After successful testing:

1. Try different combinations of media
2. Test with various aspect ratios and resolutions
3. Verify audio isolation with different video clips
4. Test the download functionality
5. Check that the exported video plays in different players

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the main README.md
3. Check backend logs for error messages
4. Verify FFmpeg installation
5. Check browser console for frontend errors
