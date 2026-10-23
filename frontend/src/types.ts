export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

export enum AspectRatio {
  RATIO_16_9 = "16:9",
  RATIO_9_16 = "9:16",
  RATIO_1_1 = "1:1",
  RATIO_4_3 = "4:3",
}

export enum Resolution {
  P480 = "480p",
  P720 = "720p",
  P1080 = "1080p",
  P1440 = "1440p",
}

export enum OutputFormat {
  MP4 = "mp4",
  WEBM = "webm",
  MOV = "mov",
}

export enum ImageDisplayMode {
  FIT = "fit",
  FILL = "fill",
  BLURRED = "blurred",
}

export enum Transition {
  CUT = "cut",
  FADE = "fade",
  CROSSFADE = "crossfade",
}

export enum AudioBehavior {
  LOOP = "loop",
  STOP = "stop",
}

export enum RenderStatus {
  PENDING = "pending",
  PREPARING = "preparing",
  PROCESSING_IMAGES = "processing_images",
  PROCESSING_VIDEOS = "processing_videos",
  COMBINING = "combining",
  ADDING_AUDIO = "adding_audio",
  ENCODING = "encoding",
  VALIDATING = "validating",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface MediaItem {
  id: string;
  type: MediaType;
  filename: string;
  duration?: number;
  image_duration: number;
  video_start?: number;
  video_end?: number;
  display_mode: ImageDisplayMode;
  transition: Transition;
}

export interface AudioConfig {
  audio_id?: string;
  filename?: string;
  volume: number;
  start_offset: number;
  fade_in: boolean;
  fade_out: boolean;
  behavior: AudioBehavior;
}

export interface VideoSettings {
  aspect_ratio: AspectRatio;
  resolution: Resolution;
  frame_rate: number;
  format: OutputFormat;
  quality: string;
}

export interface Project {
  id: string;
  name: string;
  media: MediaItem[];
  audio: AudioConfig;
  settings: VideoSettings;
  created_at: string;
  updated_at: string;
}

export interface RenderProgress {
  status: RenderStatus;
  progress: number;
  message: string;
  error?: string;
}

export interface Render {
  id: string;
  project_id: string;
  status: RenderStatus;
  progress: RenderProgress;
  output_filename?: string;
  created_at: string;
  completed_at?: string;
}
