import os
import subprocess
import asyncio
from typing import Optional
from config import settings
from models.storage import storage
from models.schemas import RenderStatus, AspectRatio, Resolution, OutputFormat


RESOLUTION_MAP = {
    Resolution.P480: (854, 480),
    Resolution.P720: (1280, 720),
    Resolution.P1080: (1920, 1080),
    Resolution.P1440: (2560, 1440),
}

ASPECT_RATIO_MAP = {
    AspectRatio.RATIO_16_9: (16, 9),
    AspectRatio.RATIO_9_16: (9, 16),
    AspectRatio.RATIO_1_1: (1, 1),
    AspectRatio.RATIO_4_3: (4, 3),
}


def get_dimensions(aspect_ratio: AspectRatio, resolution: Resolution) -> tuple:
    target_width, target_height = RESOLUTION_MAP[resolution]
    ar_width, ar_height = ASPECT_RATIO_MAP[aspect_ratio]

    if aspect_ratio == AspectRatio.RATIO_16_9:
        return target_width, target_height
    elif aspect_ratio == AspectRatio.RATIO_9_16:
        return target_height, target_width
    elif aspect_ratio == AspectRatio.RATIO_1_1:
        return target_height, target_height
    elif aspect_ratio == AspectRatio.RATIO_4_3:
        if resolution == Resolution.P1080:
            return 1440, 1080
        elif resolution == Resolution.P720:
            return 960, 720
        elif resolution == Resolution.P480:
            return 640, 480
        else:
            return target_width, target_height

    return target_width, target_height


def run_ffmpeg_command(cmd: list, timeout: int = None) -> tuple:
    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        stdout, stderr = process.communicate(timeout=timeout)
        return process.returncode, stdout, stderr
    except subprocess.TimeoutExpired:
        process.kill()
        return -1, "", "Command timed out"
    except Exception as e:
        return -1, "", str(e)


def update_render_progress(render_id: str, status: RenderStatus, progress: float, message: str):
    storage.update_render(render_id, status=status, progress=progress, message=message)


async def render_video(render_id: str, project_id: str):
    try:
        render = storage.get_render(render_id)
        project = storage.get_project(project_id)

        if not project or not render:
            storage.update_render(render_id, status=RenderStatus.FAILED, error="Project or render not found")
            return

        if not project.media:
            storage.update_render(render_id, status=RenderStatus.FAILED, error="No media in project")
            return

        render_dir = os.path.join(settings.temp_dir, render_id)
        os.makedirs(render_dir, exist_ok=True)

        update_render_progress(render_id, RenderStatus.PREPARING, 5, "Preparing media files")

        width, height = get_dimensions(project.settings.aspect_ratio, project.settings.resolution)
        frame_rate = project.settings.frame_rate

        segments = []
        total_duration = 0

        for i, media_item in enumerate(project.media):
            media_file = storage.get_media_file(media_item.id)
            if not media_file:
                continue

            progress = 5 + (i / len(project.media)) * 30
            update_render_progress(render_id, RenderStatus.PROCESSING_VIDEOS, progress, f"Processing {media_item.filename}")

            segment_path = os.path.join(render_dir, f"segment_{i:03d}.mp4")

            if media_item.type.value == "image":
                duration = media_item.image_duration
                cmd = [
                    settings.ffmpeg_path,
                    "-loop", "1",
                    "-i", media_file["path"],
                    "-vf", f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2",
                    "-c:v", "libx264",
                    "-t", str(duration),
                    "-pix_fmt", "yuv420p",
                    "-r", str(frame_rate),
                    "-an",
                    "-y",
                    segment_path
                ]
                run_ffmpeg_command(cmd, timeout=60)
                total_duration += duration

            elif media_item.type.value == "video":
                video_start = media_item.video_start or 0
                video_end = media_item.video_end

                duration_filter = ""
                if video_end and video_end > video_start:
                    duration = video_end - video_start
                    duration_filter = f"-t {duration}"

                cmd = [
                    settings.ffmpeg_path,
                    "-ss", str(video_start),
                    "-i", media_file["path"],
                    "-vf", f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2",
                    "-c:v", "libx264",
                    "-an",
                    "-r", str(frame_rate),
                    "-pix_fmt", "yuv420p",
                ]

                if duration_filter:
                    cmd.extend(duration_filter.split())

                cmd.extend(["-y", segment_path])
                run_ffmpeg_command(cmd, timeout=120)

                probe_cmd = [
                    settings.ffprobe_path,
                    "-v", "error",
                    "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1",
                    segment_path
                ]
                _, duration_output, _ = run_ffmpeg_command(probe_cmd, timeout=10)
                try:
                    segment_duration = float(duration_output.strip())
                    total_duration += segment_duration
                except:
                    total_duration += 5

            segments.append(segment_path)

        if not segments:
            storage.update_render(render_id, status=RenderStatus.FAILED, error="No valid segments created")
            return

        update_render_progress(render_id, RenderStatus.COMBINING, 40, "Combining segments")

        concat_list_path = os.path.join(render_dir, "concat.txt")
        with open(concat_list_path, "w") as f:
            for segment in segments:
                f.write(f"file '{segment}'\n")

        combined_path = os.path.join(render_dir, "combined.mp4")
        cmd = [
            settings.ffmpeg_path,
            "-f", "concat",
            "-safe", "0",
            "-i", concat_list_path,
            "-c", "copy",
            "-y",
            combined_path
        ]
        returncode, _, stderr = run_ffmpeg_command(cmd, timeout=300)

        if returncode != 0:
            storage.update_render(render_id, status=RenderStatus.FAILED, error=f"Combining failed: {stderr}")
            return

        update_render_progress(render_id, RenderStatus.ADDING_AUDIO, 70, "Adding audio")

        final_output_path = os.path.join(settings.output_dir, f"{render_id}.{project.settings.format.value}")

        if project.audio.audio_id:
            audio_file = storage.get_media_file(project.audio.audio_id)
            if audio_file:
                audio_path = audio_file["path"]

                audio_filters = []
                if project.audio.volume != 1.0:
                    audio_filters.append(f"volume={project.audio.volume}")

                if project.audio.fade_in:
                    audio_filters.append("afade=t=in:st=0:d=1")
                if project.audio.fade_out:
                    audio_filters.append(f"afade=t=out:st={total_duration-1}:d=1")

                audio_filter_str = ",".join(audio_filters) if audio_filters else None

                if project.audio.behavior.value == "loop":
                    audio_cmd = [
                        settings.ffmpeg_path,
                        "-stream_loop", "-1",
                        "-i", audio_path,
                        "-i", combined_path,
                        "-shortest",
                        "-c:v", "copy",
                    ]
                else:
                    audio_cmd = [
                        settings.ffmpeg_path,
                        "-i", audio_path,
                        "-i", combined_path,
                        "-c:v", "copy",
                    ]

                if audio_filter_str:
                    audio_cmd.extend(["-af", audio_filter_str])

                audio_cmd.extend([
                    "-c:a", "aac",
                    "-y",
                    final_output_path
                ])
                run_ffmpeg_command(audio_cmd, timeout=300)
            else:
                combined_cmd = [
                    settings.ffmpeg_path,
                    "-i", combined_path,
                    "-c", "copy",
                    "-y",
                    final_output_path
                ]
                run_ffmpeg_command(combined_cmd, timeout=60)
        else:
            combined_cmd = [
                settings.ffmpeg_path,
                "-i", combined_path,
                "-c", "copy",
                "-y",
                final_output_path
            ]
            run_ffmpeg_command(combined_cmd, timeout=60)

        update_render_progress(render_id, RenderStatus.VALIDATING, 95, "Validating output")

        if not os.path.exists(final_output_path):
            storage.update_render(render_id, status=RenderStatus.FAILED, error="Output file not created")
            return

        probe_cmd = [
            settings.ffprobe_path,
            "-v", "error",
            "-show_entries", "stream=codec_type",
            "-of", "default=noprint_wrappers=1",
            final_output_path
        ]
        _, probe_output, _ = run_ffmpeg_command(probe_cmd, timeout=10)

        audio_streams = probe_output.count("codec_type=audio")
        if audio_streams > 1:
            storage.update_render(render_id, status=RenderStatus.FAILED, error="Multiple audio streams detected")
            return

        output_filename = f"video_{render_id}.{project.settings.format.value}"
        storage.update_render(
            render_id,
            status=RenderStatus.COMPLETED,
            progress=100,
            message="Render completed",
            output_filename=output_filename
        )

    except Exception as e:
        storage.update_render(render_id, status=RenderStatus.FAILED, error=str(e))
    finally:
        render_dir = os.path.join(settings.temp_dir, render_id)
        if os.path.exists(render_dir):
            import shutil
            shutil.rmtree(render_dir, ignore_errors=True)
