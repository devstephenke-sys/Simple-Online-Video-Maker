from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    upload_dir: str = "./uploads"
    temp_dir: str = "./temp"
    output_dir: str = "./output"
    max_upload_size: int = 524288000  # 500MB
    max_project_files: int = 50

    ffmpeg_path: str = "ffmpeg"
    ffprobe_path: str = "ffprobe"
    max_render_jobs: int = 3
    render_timeout: int = 600  # 10 minutes

    temp_file_retention: int = 3600  # 1 hour
    output_file_retention: int = 86400  # 24 hours

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
