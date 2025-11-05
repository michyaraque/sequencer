"use client";

import { useState } from "react";
import { MessageSquarePlus, Upload, FileText } from "lucide-react";
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

interface EmptyStateProps {
  onCreateProject: (projectName: string) => void;
  onImportProject: () => void;
}

export default function EmptyState({ onCreateProject, onImportProject }: EmptyStateProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectName, setProjectName] = useState("");

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

  return (
    <>
      <div className="flex items-center justify-center h-full w-full bg-neutral-50">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquarePlus className="h-12 w-12" />
            </EmptyMedia>
            <EmptyTitle>Welcome to Dialog Maker</EmptyTitle>
            <EmptyDescription>
              Create immersive dialog flows for your game. Start by creating a new project or importing an existing one.
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
