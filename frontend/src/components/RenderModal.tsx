import { Render, RenderStatus } from "../types";

interface RenderModalProps {
  render: Render;
  onClose: () => void;
  onCancel: () => void;
  onDownload: () => void;
}

export default function RenderModal({ render, onClose, onCancel, onDownload }: RenderModalProps) {
  const getStatusColor = (status: RenderStatus) => {
    switch (status) {
      case RenderStatus.COMPLETED:
        return "bg-green-500";
      case RenderStatus.FAILED:
      case RenderStatus.CANCELLED:
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusText = (status: RenderStatus) => {
    switch (status) {
      case RenderStatus.PENDING:
        return "Queued";
      case RenderStatus.PREPARING:
        return "Preparing";
      case RenderStatus.PROCESSING_IMAGES:
        return "Processing images";
      case RenderStatus.PROCESSING_VIDEOS:
        return "Processing videos";
      case RenderStatus.COMBINING:
        return "Combining segments";
      case RenderStatus.ADDING_AUDIO:
        return "Adding audio";
      case RenderStatus.ENCODING:
        return "Encoding";
      case RenderStatus.VALIDATING:
        return "Validating";
      case RenderStatus.COMPLETED:
        return "Completed";
      case RenderStatus.FAILED:
        return "Failed";
      case RenderStatus.CANCELLED:
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Rendering Video</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg
              className="w-5 h-5 text-gray-500"
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

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(render.status)}`} />
            <span className="font-medium">{getStatusText(render.status)}</span>
          </div>

          {render.progress.message && (
            <p className="text-sm text-gray-600">{render.progress.message}</p>
          )}

          {render.status !== RenderStatus.COMPLETED &&
           render.status !== RenderStatus.FAILED &&
           render.status !== RenderStatus.CANCELLED && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${render.progress.progress}%` }}
              />
            </div>
          )}

          {render.status === RenderStatus.FAILED && render.progress.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {render.progress.error}
            </div>
          )}

          {render.status === RenderStatus.COMPLETED && (
            <button
              onClick={onDownload}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
            >
              Download Video
            </button>
          )}

          {render.status !== RenderStatus.COMPLETED &&
           render.status !== RenderStatus.FAILED &&
           render.status !== RenderStatus.CANCELLED && (
            <button
              onClick={onCancel}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
            >
              Cancel Render
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
