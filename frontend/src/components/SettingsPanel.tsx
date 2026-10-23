import type { VideoSettings } from "../types";
import { AspectRatio, Resolution, OutputFormat } from "../types";

interface SettingsPanelProps {
  settings: VideoSettings;
  onUpdate: (settings: VideoSettings) => void;
}

export default function SettingsPanel({ settings, onUpdate }: SettingsPanelProps) {
  const handleChange = (field: keyof VideoSettings, value: any) => {
    onUpdate({ ...settings, [field]: value });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Video Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Aspect Ratio
          </label>
          <select
            value={settings.aspect_ratio}
            onChange={(e) => handleChange("aspect_ratio", e.target.value as AspectRatio)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value={AspectRatio.RATIO_16_9}>16:9 (Landscape)</option>
            <option value={AspectRatio.RATIO_9_16}>9:16 (Portrait)</option>
            <option value={AspectRatio.RATIO_1_1}>1:1 (Square)</option>
            <option value={AspectRatio.RATIO_4_3}>4:3 (Standard)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resolution
          </label>
          <select
            value={settings.resolution}
            onChange={(e) => handleChange("resolution", e.target.value as Resolution)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value={Resolution.P480}>480p</option>
            <option value={Resolution.P720}>720p HD</option>
            <option value={Resolution.P1080}>1080p Full HD</option>
            <option value={Resolution.P1440}>1440p</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frame Rate
          </label>
          <select
            value={settings.frame_rate}
            onChange={(e) => handleChange("frame_rate", parseInt(e.target.value))}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value={24}>24 FPS</option>
            <option value={25}>25 FPS</option>
            <option value={30}>30 FPS</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Format
          </label>
          <select
            value={settings.format}
            onChange={(e) => handleChange("format", e.target.value as OutputFormat)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value={OutputFormat.MP4}>MP4 (H.264/AAC)</option>
            <option value={OutputFormat.WEBM}>WebM (VP9/Opus)</option>
            <option value={OutputFormat.MOV}>MOV</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quality
          </label>
          <select
            value={settings.quality}
            onChange={(e) => handleChange("quality", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="standard">Standard</option>
            <option value="high">High</option>
            <option value="best">Best Quality</option>
          </select>
        </div>
      </div>
    </div>
  );
}
