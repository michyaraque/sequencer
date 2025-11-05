"use client";

import { useState } from "react";
import { MessageSquarePlus, Upload, FileText, Clock, FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRecentProjectsStore, RecentProject } from "@/store/recentProjectsStore";
import { useGameDialogStore } from "@/store/gameDialogStore";

interface EmptyStateProps {
  onCreateProject: (projectName: string) => void;
  onImportProject: () => void;
  onLoadRecentProject: () => void;
}

export default function EmptyState({ onCreateProject, onImportProject, onLoadRecentProject }: EmptyStateProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectName, setProjectName] = useState("");

  const recentProjects = useRecentProjectsStore((state) => state.recentProjects);
  const removeRecentProject = useRecentProjectsStore((state) => state.removeRecentProject);
  const projectNameFromStore = useGameDialogStore((state) => state.projectName);

  const handleCreate = () => {
    if (projectName.trim()) {
      onCreateProject(projectName.trim());
      setShowCreateDialog(false);
      setProjectName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && projectName.trim()) {
      handleCreate();
    }
  };

  const handleLoadRecent = (project: RecentProject) => {
    // The current project in localStorage should match this name
    if (projectNameFromStore === project.name) {
      onLoadRecentProject();
    }
  };

  const handleRemoveRecent = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    removeRecentProject(projectId);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="flex items-center justify-center h-full w-full bg-neutral-50 p-8">
        <div className="max-w-4xl w-full space-y-8">
          {/* Recent Projects Section */}
          {recentProjects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-neutral-600" />
                <h2 className="text-lg font-bold text-neutral-800">Recent Projects</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleLoadRecent(project)}
                    className="group relative bg-white border-2 border-neutral-200 rounded-lg p-4 text-left hover:border-neutral-400 hover:shadow-md transition-all cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleLoadRecent(project);
                      }
                    }}
                  >
                    <button
                      onClick={(e) => handleRemoveRecent(e, project.id)}
                      className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-100 transition-opacity"
                      title="Remove from recents"
                    >
                      <X className="h-3 w-3 text-neutral-500" />
                    </button>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-neutral-100 rounded">
                        <FolderOpen className="h-5 w-5 text-neutral-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-800 truncate mb-1">
                          {project.name}
                        </h3>
                        <p className="text-xs text-neutral-500 mb-2">
                          {formatDate(project.lastModified)}
                        </p>
                        <div className="flex gap-3 text-xs text-neutral-600">
                          <span>{project.nodeCount} nodes</span>
                          <span>•</span>
                          <span>{project.speechCount} speeches</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquarePlus className="h-12 w-12" />
              </EmptyMedia>
              <EmptyTitle>
                {recentProjects.length > 0 ? "Start a New Project" : "Welcome to Dialog Maker"}
              </EmptyTitle>
              <EmptyDescription>
                {recentProjects.length > 0
                  ? "Create a new dialog project or import an existing one from your files."
                  : "Create immersive dialog flows for your game. Start by creating a new project or importing an existing one."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Button onClick={() => setShowCreateDialog(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Project
                </Button>
                <Button variant="outline" onClick={onImportProject}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Project
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Give your dialog project a name. You can change it later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="My Awesome Dialog"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!projectName.trim()}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
