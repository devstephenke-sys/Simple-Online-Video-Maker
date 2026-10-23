import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import type { MediaItem } from "../types";
import { MediaType } from "../types";

interface TimelineProps {
  media: MediaItem[];
  projectId: string;
  onUpdate: (media: MediaItem[]) => void;
  onDelete: (mediaId: string) => void;
  onPreview: (index: number) => void;
}

export default function Timeline({ media, projectId, onUpdate, onDelete, onPreview }: TimelineProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(media);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onUpdate(items);
  };

  const handleDurationChange = (mediaId: string, duration: number) => {
    const updatedMedia = media.map((item) =>
      item.id === mediaId ? { ...item, image_duration: duration } : item
    );
    onUpdate(updatedMedia);
  };

  const totalDuration = media.reduce((acc, item) => {
    if (item.type === MediaType.IMAGE) {
      return acc + item.image_duration;
    }
    return acc + (item.duration || 0);
  }, 0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <span className="text-sm text-gray-500">
          Total: {formatDuration(totalDuration)}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {media.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>No media added yet</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="timeline">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {media.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-gray-50 rounded-lg p-3 border ${
                            snapshot.isDragging
                              ? "border-blue-500 shadow-lg"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing mt-1"
                            >
                              <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 8h16M4 16h16"
                                />
                              </svg>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                  {item.type === MediaType.IMAGE ? "IMG" : "VID"}
                                </span>
                                <span className="text-sm font-medium text-gray-700 truncate">
                                  {item.filename}
                                </span>
                              </div>

                              {item.type === MediaType.IMAGE && (
                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-gray-500">
                                    Duration:
                                  </label>
                                  <select
                                    value={item.image_duration}
                                    onChange={(e) =>
                                      handleDurationChange(
                                        item.id,
                                        parseFloat(e.target.value)
                                      )
                                    }
                                    className="text-xs border rounded px-2 py-1"
                                  >
                                    <option value={3}>3s</option>
                                    <option value={5}>5s</option>
                                    <option value={7}>7s</option>
                                    <option value={10}>10s</option>
                                  </select>
                                </div>
                              )}

                              {item.type === MediaType.VIDEO && (
                                <div className="text-xs text-gray-500">
                                  Duration: {item.duration?.toFixed(1)}s
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onPreview(index)}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Preview"
                              >
                                <svg
                                  className="w-4 h-4 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => onDelete(item.id)}
                                className="p-1 hover:bg-red-100 rounded"
                                title="Remove"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
