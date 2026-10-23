import { useState, useRef } from "react";

interface UploadAreaProps {
  onUpload: (files: File[]) => void;
}

export default function UploadArea({ onUpload }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") ||
        file.type.startsWith("video/")
    );

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Upload Media</h2>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <svg
          className="w-12 h-12 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-gray-600 mb-2">
          Drag and drop images or videos here
        </p>
        <p className="text-sm text-gray-400">or click to browse</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="mt-4 text-sm text-gray-500">
        <p className="font-medium mb-1">Supported formats:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Images: JPG, PNG, WebP</li>
          <li>Videos: MP4, MOV, WebM</li>
        </ul>
      </div>
    </div>
  );
}
