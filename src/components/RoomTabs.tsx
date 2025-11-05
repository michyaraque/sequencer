"use client";

import { useState } from "react";
import { useRoomsStore } from "@/store/useRoomsStore";
import { Plus, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RoomTabs() {
  const rooms = useRoomsStore((state) => state.rooms);
  const currentRoomId = useRoomsStore((state) => state.currentRoomId);
  const addRoom = useRoomsStore((state) => state.addRoom);
  const deleteRoom = useRoomsStore((state) => state.deleteRoom);
  const switchRoom = useRoomsStore((state) => state.switchRoom);

  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [confirmationText, setConfirmationText] = useState("");

  const handleAddRoom = () => {
    const newRoomNumber = rooms.length + 1;
    addRoom(`Room ${newRoomNumber}`);
    toast.success(`Room ${newRoomNumber} created`);
  };

  const handleDeleteClick = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();

    if (rooms.length === 1) {
      toast.error("Cannot delete the last room");
      return;
    }

    setDeletingRoomId(roomId);
    setConfirmationText("");
  };

  const handleConfirmDelete = () => {
    if (!deletingRoomId) return;

    const roomToDelete = rooms.find(r => r.id === deletingRoomId);
    if (!roomToDelete) return;

    if (confirmationText !== roomToDelete.name) {
      toast.error(`Please enter "${roomToDelete.name}" to confirm deletion`);
      return;
    }

    deleteRoom(deletingRoomId);
    toast.success(`${roomToDelete.name} deleted`);
    setDeletingRoomId(null);
    setConfirmationText("");
  };

  const handleCancelDelete = () => {
    setDeletingRoomId(null);
    setConfirmationText("");
  };

  const deletingRoom = rooms.find(r => r.id === deletingRoomId);

  return (
    <>
      <div className="flex items-center gap-1 bg-neutral-50 border-b border-neutral-200 px-4 py-2 overflow-x-auto">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer transition-colors group ${
              currentRoomId === room.id
                ? "bg-white border border-b-0 border-neutral-300 font-medium text-neutral-900"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900"
            }`}
            onClick={() => switchRoom(room.id)}
          >
            <span className="text-sm whitespace-nowrap">{room.name}</span>
            {rooms.length > 1 && (
              <button
                onClick={(e) => handleDeleteClick(e, room.id)}
                className={`p-0.5 rounded hover:bg-neutral-300 transition-colors ${
                  currentRoomId === room.id ? "opacity-60 hover:opacity-100" : "opacity-0 group-hover:opacity-60 group-hover:hover:opacity-100"
                }`}
                title="Delete room"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleAddRoom}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-neutral-700 text-white hover:bg-neutral-800 transition-colors text-sm font-medium ml-2"
          title="Add new room"
        >
          <Plus size={16} />
          New Room
        </button>
      </div>

      <AlertDialog open={deletingRoomId !== null} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room and all its data (nodes, edges, speeches, NPCs, and variables).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Type <span className="font-bold text-neutral-900">{deletingRoom?.name}</span> to confirm:
            </label>
            <Input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={deletingRoom?.name}
              className="w-full"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={confirmationText !== deletingRoom?.name}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
