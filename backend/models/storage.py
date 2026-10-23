from typing import Dict, List, Optional
from datetime import datetime
import uuid
from models.schemas import (
    Project,
    MediaItem,
    AudioConfig,
    VideoSettings,
    Render,
    RenderStatus,
    RenderProgress,
)


class Storage:
    def __init__(self):
        self.projects: Dict[str, Project] = {}
        self.renders: Dict[str, Render] = {}
        self.media_files: Dict[str, dict] = {}  # {media_id: {filename, path, type}}

    def create_project(self, name: str) -> Project:
        project_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        project = Project(
            id=project_id,
            name=name,
            media=[],
            audio=AudioConfig(),
            settings=VideoSettings(),
            created_at=now,
            updated_at=now,
        )
        self.projects[project_id] = project
        return project

    def get_project(self, project_id: str) -> Optional[Project]:
        return self.projects.get(project_id)

    def update_project(self, project_id: str, **kwargs) -> Optional[Project]:
        project = self.projects.get(project_id)
        if not project:
            return None

        if "name" in kwargs and kwargs["name"] is not None:
            project.name = kwargs["name"]
        if "media" in kwargs and kwargs["media"] is not None:
            project.media = kwargs["media"]
        if "audio" in kwargs and kwargs["audio"] is not None:
            project.audio = kwargs["audio"]
        if "settings" in kwargs and kwargs["settings"] is not None:
            project.settings = kwargs["settings"]

        project.updated_at = datetime.utcnow().isoformat()
        return project

    def delete_project(self, project_id: str) -> bool:
        if project_id in self.projects:
            del self.projects[project_id]
            return True
        return False

    def create_render(self, project_id: str) -> Render:
        render_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        render = Render(
            id=render_id,
            project_id=project_id,
            status=RenderStatus.PENDING,
            progress=RenderProgress(status=RenderStatus.PENDING, message="Render queued"),
            created_at=now,
        )
        self.renders[render_id] = render
        return render

    def get_render(self, render_id: str) -> Optional[Render]:
        return self.renders.get(render_id)

    def update_render(
        self,
        render_id: str,
        status: Optional[RenderStatus] = None,
        progress: Optional[float] = None,
        message: Optional[str] = None,
        error: Optional[str] = None,
        output_filename: Optional[str] = None,
    ) -> Optional[Render]:
        render = self.renders.get(render_id)
        if not render:
            return None

        if status is not None:
            render.status = status
            render.progress.status = status
        if progress is not None:
            render.progress.progress = progress
        if message is not None:
            render.progress.message = message
        if error is not None:
            render.progress.error = error
        if output_filename is not None:
            render.output_filename = output_filename
        if status == RenderStatus.COMPLETED:
            render.completed_at = datetime.utcnow().isoformat()

        return render

    def store_media_file(self, media_id: str, filename: str, path: str, media_type: str):
        self.media_files[media_id] = {
            "filename": filename,
            "path": path,
            "type": media_type,
        }

    def get_media_file(self, media_id: str) -> Optional[dict]:
        return self.media_files.get(media_id)

    def delete_media_file(self, media_id: str) -> bool:
        if media_id in self.media_files:
            del self.media_files[media_id]
            return True
        return False


storage = Storage()
