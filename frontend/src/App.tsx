import { useState, useEffect } from "react";
import type { Project, Render } from "./types";
import { RenderStatus } from "./types";
import { api } from "./api";
import Header from "./components/Header";
import UploadArea from "./components/UploadArea";
import Timeline from "./components/Timeline";
import Preview from "./components/Preview";
import SettingsPanel from "./components/SettingsPanel";
import AudioPanel from "./components/AudioPanel";
import RenderModal from "./components/RenderModal";

function App() {
  const [project, setProject] = useState<Project | null>(null);
  const [render, setRender] = useState<Render | null>(null);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (!project) {
      createNewProject();
    }
  }, []);

  const createNewProject = async () => {
    try {
      const newProject = await api.projects.create("New Project");
      setProject(newProject);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleMediaUpload = async (files: File[]) => {
    if (!project) return;

    for (const file of files) {
      try {
        await api.media.upload(project.id, file);
      } catch (error) {
        console.error("Failed to upload file:", error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    const updatedProject = await api.projects.get(project.id);
    setProject(updatedProject);
  };

  const handleMediaDelete = async (mediaId: string) => {
    if (!project) return;

    try {
      await api.media.delete(project.id, mediaId);
      const updatedProject = await api.projects.get(project.id);
      setProject(updatedProject);
    } catch (error) {
      console.error("Failed to delete media:", error);
    }
  };

  const handleTimelineUpdate = async (media: any[]) => {
    if (!project) return;

    try {
      await api.projects.update(project.id, { media });
      const updatedProject = await api.projects.get(project.id);
      setProject(updatedProject);
    } catch (error) {
      console.error("Failed to update timeline:", error);
    }
  };

  const handleAudioUpload = async (file: File) => {
    if (!project) return;

    try {
      await api.audio.upload(project.id, file);
      const updatedProject = await api.projects.get(project.id);
      setProject(updatedProject);
    } catch (error) {
      console.error("Failed to upload audio:", error);
      alert("Failed to upload audio");
    }
  };

  const handleAudioDelete = async () => {
    if (!project) return;

    try {
      await api.audio.delete(project.id);
      const updatedProject = await api.projects.get(project.id);
      setProject(updatedProject);
    } catch (error) {
      console.error("Failed to delete audio:", error);
    }
  };

  const handleSettingsUpdate = async (settings: any) => {
    if (!project) return;

    try {
      await api.projects.update(project.id, { settings });
      const updatedProject = await api.projects.get(project.id);
      setProject(updatedProject);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  const handleRender = async () => {
    if (!project) return;

    try {
      const newRender = await api.render.create(project.id);
      setRender(newRender);
      setIsRenderModalOpen(true);
    } catch (error) {
      console.error("Failed to start render:", error);
      alert("Failed to start render");
    }
  };

  const handleRenderCancel = async () => {
    if (!render) return;

    try {
      await api.render.cancel(render.id);
      const updatedRender = await api.render.get(render.id);
      setRender(updatedRender);
    } catch (error) {
      console.error("Failed to cancel render:", error);
    }
  };

  const handleDownload = async () => {
    if (!render) return;

    try {
      const blob = await api.render.download(render.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = render.output_filename || "video.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download:", error);
      alert("Failed to download video");
    }
  };

  useEffect(() => {
    if (render && render.status !== RenderStatus.COMPLETED && render.status !== RenderStatus.FAILED && render.status !== RenderStatus.CANCELLED) {
      let retryCount = 0;
      let intervalId: number | null = null;
      let timeoutId: number | null = null;

      const pollRender = async () => {
        try {
          const updatedRender = await api.render.get(render.id);
          setRender(updatedRender);
          retryCount = 0; // Reset retry count on success
        } catch (error) {
          console.error("Failed to poll render status:", error);
          retryCount++;

          // Exponential backoff: increase interval after multiple failures
          if (retryCount >= 3) {
            console.warn(`Multiple poll failures (${retryCount}), backing off`);
            if (intervalId) clearInterval(intervalId);
            const backoffTime = Math.min(5000 * Math.pow(2, retryCount - 3), 30000); // Max 30s
            timeoutId = window.setTimeout(pollRender, backoffTime);
          }
        }
      };

      // Initial poll
      pollRender();

      // Set up regular polling with 2-second interval (reduced from 1s to reduce load)
      intervalId = window.setInterval(pollRender, 2000);

      return () => {
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [render]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header onNewProject={createNewProject} />

      <div className="flex-1 flex">
        <div className="w-64 bg-white border-r p-4">
          <UploadArea onUpload={handleMediaUpload} />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <Preview
              project={project}
              currentIndex={previewIndex}
              onIndexChange={setPreviewIndex}
            />
          </div>

          <div className="h-64 bg-white border-t">
            <Timeline
              media={project.media}
              projectId={project.id}
              onUpdate={handleTimelineUpdate}
              onDelete={handleMediaDelete}
              onPreview={setPreviewIndex}
            />
          </div>
        </div>

        <div className="w-80 bg-white border-l p-4 overflow-y-auto">
          <AudioPanel
            audio={project.audio}
            projectId={project.id}
            onUpload={handleAudioUpload}
            onDelete={handleAudioDelete}
            onUpdate={(audio) => {
              api.projects.update(project.id, { audio }).then(setProject);
            }}
          />

          <div className="mt-6">
            <SettingsPanel
              settings={project.settings}
              onUpdate={handleSettingsUpdate}
            />
          </div>

          <button
            onClick={handleRender}
            disabled={!project.media.length || !!render && render.status !== RenderStatus.COMPLETED && render.status !== RenderStatus.FAILED && render.status !== RenderStatus.CANCELLED}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {render && render.status !== RenderStatus.COMPLETED && render.status !== RenderStatus.FAILED && render.status !== RenderStatus.CANCELLED
              ? "Rendering..."
              : "Create Video"}
          </button>
        </div>
      </div>

      {isRenderModalOpen && render && (
        <RenderModal
          render={render}
          onClose={() => setIsRenderModalOpen(false)}
          onCancel={handleRenderCancel}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}

export default App;
