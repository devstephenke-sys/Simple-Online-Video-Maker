from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
import aiofiles
from typing import List
from config import settings
from models.schemas import MediaType, MediaItem
from models.storage import storage

router = APIRouter()

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"]
ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/x-mpeg", "audio/wav", "audio/aac", "audio/mp4", "audio/x-m4a"]


@router.post("/{project_id}/media")
async def upload_media(project_id: str, file: UploadFile = File(...)):
    project = storage.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if len(project.media) >= settings.max_project_files:
        raise HTTPException(
            status_code=400, detail=f"Maximum {settings.max_project_files} files allowed"
        )

    file_size = 0
    content = await file.read()
    file_size = len(content)

    if file_size > settings.max_upload_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum of {settings.max_upload_size} bytes",
        )

    media_type = None
    if file.content_type in ALLOWED_IMAGE_TYPES:
        media_type = MediaType.IMAGE
    elif file.content_type in ALLOWED_VIDEO_TYPES:
        media_type = MediaType.VIDEO
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}",
        )

    media_id = str(uuid.uuid4())
    safe_filename = f"{media_id}_{file.filename}"
    file_path = os.path.join(settings.upload_dir, safe_filename)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    storage.store_media_file(media_id, file.filename, file_path, media_type.value)

    media_item = MediaItem(
        id=media_id,
        type=media_type,
        filename=file.filename,
    )

    project.media.append(media_item)
    storage.update_project(project_id, media=project.media)

    return {"media_id": media_id, "type": media_type.value, "filename": file.filename}


@router.delete("/{project_id}/media/{media_id}")
async def delete_media(project_id: str, media_id: str):
    project = storage.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    media_file = storage.get_media_file(media_id)
    if media_file:
        file_path = media_file["path"]
        if os.path.exists(file_path):
            os.remove(file_path)
        storage.delete_media_file(media_id)

    project.media = [m for m in project.media if m.id != media_id]
    storage.update_project(project_id, media=project.media)

    return {"message": "Media deleted"}


@router.get("/{project_id}/media/{media_id}/thumbnail")
async def get_media_thumbnail(project_id: str, media_id: str):
    project = storage.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    media_item = next((m for m in project.media if m.id == media_id), None)
    if not media_item:
        raise HTTPException(status_code=404, detail="Media not found")

    media_file = storage.get_media_file(media_id)
    if not media_file:
        raise HTTPException(status_code=404, detail="Media file not found")

    if media_item.type == MediaType.IMAGE:
        return FileResponse(media_file["path"])
    else:
        return FileResponse(media_file["path"])
