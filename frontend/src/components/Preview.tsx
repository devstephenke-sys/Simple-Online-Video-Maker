import { useRef, useState, useEffect } from "react";
import type { Project } from "../types";
import { MediaType } from "../types";

interface PreviewProps {
  project: Project;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export default function Preview({ project, currentIndex, onIndexChange }: PreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentItem = project.media[currentIndex];

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex]);

  const handleNext = () => {
    if (currentIndex < project.media.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const getThumbnailUrl = (mediaId: string) => {
    return `/api/projects/${project.id}/media/${mediaId}/thumbnail`;
  };

  const getPreviewStyle = () => {
    const aspectRatio = project.settings.aspect_ratio;
    switch (aspectRatio) {
      case "16:9":
        return { maxWidth: "100%", aspectRatio: "16/9" };
      case "9:16":
        return { maxWidth: "400px", aspectRatio: "9/16" };
      case "1:1":
        return { maxWidth: "500px", aspectRatio: "1/1" };
      case "4:3":
        return { maxWidth: "100%", aspectRatio: "4/3" };
      default:
        return { maxWidth: "100%", aspectRatio: "16/9" };
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Preview</h2>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-900 p-8">
        {currentItem ? (
          <div className="relative" style={getPreviewStyle()}>
            {currentItem.type === MediaType.IMAGE ? (
              <img
                src={getThumbnailUrl(currentItem.id)}
                alt={currentItem.filename}
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <video
                ref={videoRef}
                src={getThumbnailUrl(currentItem.id)}
                muted
                className="w-full h-full object-contain bg-black"
                onEnded={handleNext}
                onError={() => setIsPlaying(false)}
              />
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/70 rounded-lg px-4 py-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="p-2 hover:bg-white/20 rounded disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 hover:bg-white/20 rounded"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === project.media.length - 1}
                className="p-2 hover:bg-white/20 rounded disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p>Add media to preview</p>
          </div>
        )}
      </div>

      {currentItem && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <p className="text-sm text-gray-600 truncate">
            {currentIndex + 1} / {project.media.length}: {currentItem.filename}
          </p>
        </div>
      )}
    </div>
  );
}
