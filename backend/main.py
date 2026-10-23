from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Simple Video Maker API", version="1.0.0")

# Log CORS origins for debugging
logger.info(f"CORS Origins: {settings.cors_origins_list}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.temp_dir, exist_ok=True)
os.makedirs(settings.output_dir, exist_ok=True)

from routers import projects, media, audio, render

app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(media.router, prefix="/api/projects", tags=["media"])
app.include_router(audio.router, prefix="/api/projects", tags=["audio"])
app.include_router(render.router, prefix="/api/renders", tags=["render"])


@app.get("/")
async def root():
    return {"message": "Simple Video Maker API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
