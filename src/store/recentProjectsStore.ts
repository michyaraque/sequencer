import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentProject {
  id: string;
  name: string;
  lastModified: number; // timestamp
  nodeCount: number;
  speechCount: number;
}

interface RecentProjectsStore {
  recentProjects: RecentProject[];
  addRecentProject: (project: Omit<RecentProject, "id" | "lastModified">) => void;
  removeRecentProject: (id: string) => void;
  clearRecentProjects: () => void;
}

export const useRecentProjectsStore = create<RecentProjectsStore>()(
  persist(
    (set) => ({
      recentProjects: [],

      addRecentProject: (project) =>
        set((state) => {
          const now = Date.now();
          const id = `project-${now}`;

          // Check if project with same name exists
          const existingIndex = state.recentProjects.findIndex(
            (p) => p.name === project.name
          );

          let updatedProjects = [...state.recentProjects];

          if (existingIndex !== -1) {
            // Update existing project
            updatedProjects[existingIndex] = {
              ...updatedProjects[existingIndex],
              lastModified: now,
              nodeCount: project.nodeCount,
              speechCount: project.speechCount,
            };
          } else {
            // Add new project
            updatedProjects.unshift({
              id,
              ...project,
              lastModified: now,
            });
          }

          // Keep only the 5 most recent projects
          updatedProjects = updatedProjects
            .sort((a, b) => b.lastModified - a.lastModified)
            .slice(0, 5);

          return { recentProjects: updatedProjects };
        }),

      removeRecentProject: (id) =>
        set((state) => ({
          recentProjects: state.recentProjects.filter((p) => p.id !== id),
        })),

      clearRecentProjects: () => set({ recentProjects: [] }),
    }),
    {
      name: "recent-projects-storage",
    }
  )
);
