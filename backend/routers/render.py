from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import os
from models.schemas import RenderCreate, Render
from models.storage import storage
from services.render_service import render_video

router = APIRouter()


@router.post("", response_model=Render)
async def create_render(render: RenderCreate, background_tasks: BackgroundTasks):
    project = storage.get_project(render.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    render_obj = storage.create_render(render.project_id)
    background_tasks.add_task(render_video, render_obj.id, render.project_id)

    return render_obj


@router.get("/{render_id}", response_model=Render)
async def get_render(render_id: str):
    render = storage.get_render(render_id)
    if not render:
        raise HTTPException(status_code=404, detail="Render not found")
    return render


@router.post("/{render_id}/cancel")
async def cancel_render(render_id: str):
    render = storage.get_render(render_id)
    if not render:
        raise HTTPException(status_code=404, detail="Render not found")

    if render.status.value in ["completed", "failed", "cancelled"]:
        raise HTTPException(
            status_code=400, detail="Cannot cancel a finished render"
        )

    storage.update_render(render_id, status="cancelled")
    return {"message": "Render cancelled"}


@router.get("/{render_id}/download")
async def download_render(render_id: str):
    render = storage.get_render(render_id)
    if not render:
        raise HTTPException(status_code=404, detail="Render not found")

    if render.status.value != "completed":
        raise HTTPException(
            status_code=400, detail="Render is not completed yet"
        )

    if not render.output_filename:
        raise HTTPException(status_code=400, detail="No output file available")

    from config import settings
    file_path = os.path.join(settings.output_dir, render.output_filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Output file not found")

    return FileResponse(
        file_path,
        media_type="video/mp4",
        filename=render.output_filename,
    )
