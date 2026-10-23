from fastapi import APIRouter, HTTPException
from models.schemas import ProjectCreate, ProjectUpdate, Project
from models.storage import storage

router = APIRouter()


@router.post("", response_model=Project)
async def create_project(project: ProjectCreate):
    return storage.create_project(project.name)


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = storage.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=Project)
async def update_project(project_id: str, update: ProjectUpdate):
    project = storage.update_project(
        project_id,
        name=update.name,
        media=update.media,
        audio=update.audio,
        settings=update.settings,
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    if not storage.delete_project(project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}
