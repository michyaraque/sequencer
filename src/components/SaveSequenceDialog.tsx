"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Node } from "@xyflow/react";
import { DialogNodeData } from "@/types/dialog";

interface SaveSequenceDialogProps {
  selectedNodes: Node<DialogNodeData>[];
  onSave: (name: string, description: string) => void;
  onClose: () => void;
}

export default function SaveSequenceDialog({
  selectedNodes,
  onSave,
  onClose,
}: SaveSequenceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim());
      setName("");
      setDescription("");
      onClose();
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Sequence</DialogTitle>
          <DialogDescription>
            Save the selected {selectedNodes.length} node{selectedNodes.length !== 1 ? 's' : ''} as a reusable sequence.
            You'll be able to create copies of this sequence from the context menu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Sequence Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Welcome Dialog"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this sequence does..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Sequence
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
