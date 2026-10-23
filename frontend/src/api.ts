import {
  Project,
  MediaItem,
  AudioConfig,
  VideoSettings,
  Render,
  RenderStatus,
} from "./types";

const API_BASE = "/api";

export const api = {
  projects: {
    create: async (name: string): Promise<Project> => {
      const response = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to create project");
      return response.json();
    },

    get: async (projectId: string): Promise<Project> => {
      const response = await fetch(`${API_BASE}/projects/${projectId}`);
      if (!response.ok) throw new Error("Failed to get project");
      return response.json();
    },

    update: async (
      projectId: string,
      updates: Partial<{
        name: string;
        media: MediaItem[];
        audio: AudioConfig;
        settings: VideoSettings;
      }>
    ): Promise<Project> => {
      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update project");
      return response.json();
    },

    delete: async (projectId: string): Promise<void> => {
      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");
    },
  },

  media: {
    upload: async (
      projectId: string,
      file: File
    ): Promise<{ media_id: string; type: string; filename: string }> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/projects/${projectId}/media`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to upload media");
      }
      return response.json();
    },

    delete: async (projectId: string, mediaId: string): Promise<void> => {
      const response = await fetch(
        `${API_BASE}/projects/${projectId}/media/${mediaId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete media");
    },

    getThumbnail: async (projectId: string, mediaId: string): Promise<string> => {
      return `${API_BASE}/projects/${projectId}/media/${mediaId}/thumbnail`;
    },
  },

  audio: {
    upload: async (
      projectId: string,
      file: File
    ): Promise<{ audio_id: string; filename: string }> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/projects/${projectId}/audio`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to upload audio");
      }
      return response.json();
    },

    delete: async (projectId: string): Promise<void> => {
      const response = await fetch(`${API_BASE}/projects/${projectId}/audio`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete audio");
    },
  },

  render: {
    create: async (projectId: string): Promise<Render> => {
      const response = await fetch(`${API_BASE}/renders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (!response.ok) throw new Error("Failed to create render");
      return response.json();
    },

    get: async (renderId: string): Promise<Render> => {
      const response = await fetch(`${API_BASE}/renders/${renderId}`);
      if (!response.ok) throw new Error("Failed to get render");
      return response.json();
    },

    cancel: async (renderId: string): Promise<void> => {
      const response = await fetch(`${API_BASE}/renders/${renderId}/cancel`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to cancel render");
    },

    download: async (renderId: string): Promise<Blob> => {
      const response = await fetch(`${API_BASE}/renders/${renderId}/download`);
      if (!response.ok) throw new Error("Failed to download video");
      return response.blob();
    },
  },
};
