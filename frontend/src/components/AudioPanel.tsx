import { useState, useRef } from "react";
import type { AudioConfig } from "../types";
import { AudioBehavior } from "../types";

interface AudioPanelProps {
  audio: AudioConfig;
  projectId: string;
  onUpload: (file: File) => void;
  onDelete: () => void;
  onUpdate: (audio: AudioConfig) => void;
}

export default function AudioPanel({ audio, projectId, onUpload, onDelete, onUpdate }: AudioPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleChange = (field: keyof AudioConfig, value: any) => {
    onUpdate({ ...audio, [field]: value });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Background Audio</h2>

      {audio.audio_id ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {audio.filename}
              </p>
            </div>
            <button
              onClick={onDelete}
              className="ml-2 p-1 hover:bg-red-100 rounded"
              title="Remove audio"
            >
              <svg
                className="w-4 h-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <audio
              ref={audioRef}
              src={`/api/projects/${projectId}/media/${audio.audio_id}/thumbnail`}
              onEnded={() => setIsPlaying(false)}
              onError={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume: {Math.round(audio.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audio.volume}
              onChange={(e) => handleChange("volume", parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audio Behavior
            </label>
            <select
              value={audio.behavior}
              onChange={(e) => handleChange("behavior", e.target.value as AudioBehavior)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value={AudioBehavior.LOOP}>Loop if shorter</option>
              <option value={AudioBehavior.STOP}>Stop when ends</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={audio.fade_in}
                onChange={(e) => handleChange("fade_in", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Fade In</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={audio.fade_out}
                onChange={(e) => handleChange("fade_out", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Fade Out</span>
            </label>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
          >
            <svg
              className="w-8 h-8 mx-auto mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <p className="text-sm text-gray-600">Add Background Audio</p>
            <p className="text-xs text-gray-400 mt-1">MP3, WAV, AAC, M4A, MPEG</p>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.aac,.m4a,.mpeg,.mpga"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
