from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
import aiofiles
from config import settings
from models.schemas import AudioConfig
from models.storage import storage

router = APIRouter()

ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/x-mpeg", "audio/wav", "audio/aac", "audio/mp4", "audio/x-m4a"]


@router.post("/{project_id}/audio")
async def upload_audio(project_id: str, file: UploadFile = File(...)):
    project = storage.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio type: {file.content_type}",
        )

    content = await file.read()
    file_size = len(content)

    if file_size > settings.max_upload_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum of {settings.max_upload_size} bytes",
        )

    audio_id = str(uuid.uuid4())
    safe_filename = f"{audio_id}_{file.filename}"
    file_path = os.path.join(settings.upload_dir, safe_filename)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    storage.store_media_file(audio_id, file.filename, file_path, "audio")

    audio_config = AudioConfig(
        audio_id=audio_id,
        filename=file.filename,
    )

    storage.update_project(project_id, audio=audio_config)

    return {"audio_id": audio_id, "filename": file.filename}


@router.delete("/{project_id}/audio")
async def delete_audio(project_id: str):
    project = storage.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.audio.audio_id:
        media_file = storage.get_media_file(project.audio.audio_id)
        if media_file:
            file_path = media_file["path"]
            if os.path.exists(file_path):
                os.remove(file_path)
            storage.delete_media_file(project.audio.audio_id)

    audio_config = AudioConfig()
    storage.update_project(project_id, audio=audio_config)

    return {"message": "Audio deleted"}
