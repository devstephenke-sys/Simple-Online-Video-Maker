from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class MediaType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"


class AspectRatio(str, Enum):
    RATIO_16_9 = "16:9"
    RATIO_9_16 = "9:16"
    RATIO_1_1 = "1:1"
    RATIO_4_3 = "4:3"


class Resolution(str, Enum):
    P480 = "480p"
    P720 = "720p"
    P1080 = "1080p"
    P1440 = "1440p"


class OutputFormat(str, Enum):
    MP4 = "mp4"
    WEBM = "webm"
    MOV = "mov"


class ImageDisplayMode(str, Enum):
    FIT = "fit"
    FILL = "fill"
    BLURRED = "blurred"


class Transition(str, Enum):
    CUT = "cut"
    FADE = "fade"
    CROSSFADE = "crossfade"


class AudioBehavior(str, Enum):
    LOOP = "loop"
    STOP = "stop"


class MediaItem(BaseModel):
    id: str
    type: MediaType
    filename: str
    duration: Optional[float] = None  # For video clips
    image_duration: float = 5.0  # For images, in seconds
    video_start: Optional[float] = 0.0  # For video trim start
    video_end: Optional[float] = None  # For video trim end
    display_mode: ImageDisplayMode = ImageDisplayMode.FIT
    transition: Transition = Transition.CUT


class AudioConfig(BaseModel):
    audio_id: Optional[str] = None
    filename: Optional[str] = None
    volume: float = 1.0
    start_offset: float = 0.0
    fade_in: bool = False
    fade_out: bool = False
    behavior: AudioBehavior = AudioBehavior.LOOP


class VideoSettings(BaseModel):
    aspect_ratio: AspectRatio = AspectRatio.RATIO_16_9
    resolution: Resolution = Resolution.P1080
    frame_rate: int = 30
    format: OutputFormat = OutputFormat.MP4
    quality: str = "high"  # standard, high, best


class ProjectCreate(BaseModel):
    name: str


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    media: Optional[List[MediaItem]] = None
    audio: Optional[AudioConfig] = None
    settings: Optional[VideoSettings] = None


class Project(BaseModel):
    id: str
    name: str
    media: List[MediaItem] = []
    audio: AudioConfig = AudioConfig()
    settings: VideoSettings = VideoSettings()
    created_at: str
    updated_at: str


class RenderStatus(str, Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    PROCESSING_IMAGES = "processing_images"
    PROCESSING_VIDEOS = "processing_videos"
    COMBINING = "combining"
    ADDING_AUDIO = "adding_audio"
    ENCODING = "encoding"
    VALIDATING = "validating"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class RenderCreate(BaseModel):
    project_id: str


class RenderProgress(BaseModel):
    status: RenderStatus
    progress: float = 0.0
    message: str = ""
    error: Optional[str] = None


class Render(BaseModel):
    id: str
    project_id: str
    status: RenderStatus
    progress: RenderProgress
    output_filename: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None
