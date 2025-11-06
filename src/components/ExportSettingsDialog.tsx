"use client";

import { useState, useEffect } from "react";
import { ExportSettings } from "@/types/dialog";
import { useGameDialogStore } from "@/store/gameDialogStore";

interface ExportSettingsDialogProps {
  onClose: () => void;
}

export default function ExportSettingsDialog({ onClose }: ExportSettingsDialogProps) {
  const exportSettings = useGameDialogStore((state) => state.exportSettings);
  const setExportSettings = useGameDialogStore((state) => state.setExportSettings);

  const [settings, setSettings] = useState<ExportSettings>(exportSettings);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSave = () => {
    setExportSettings(settings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: ExportSettings = {
      defaultBotId: "-1",
      defaultUserId: "#(user_id)",
      defaultNextNodeId: "-1",
      defaultSpeechId: "-1",
      defaultSpeechSpeed: "-1",
      defaultActionId: "1001",
      defaultValue1: "-1",
      defaultValue2: "-1",
      defaultValue3: "-1",
    };
    setSettings(defaultSettings);
  };

  const handleChange = (field: keyof ExportSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-800">Export Settings</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-neutral-600 mt-2">
            Customize default values for dialog export. These values will be used when exporting nodes to the dialog format.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Default Bot ID
              </label>
              <input
                type="text"
                value={settings.defaultBotId}
                onChange={(e) => handleChange("defaultBotId", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm"
                placeholder="-1"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Used when botId is "#(bot_id)" or empty
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Default User ID
              </label>
              <input
                type="text"
                value={settings.defaultUserId}
                onChange={(e) => handleChange("defaultUserId", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm"
                placeholder="#(user_id)"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Default user ID for all nodes
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Default Next Node ID
              </label>
              <input
                type="text"
                value={settings.defaultNextNodeId}
                onChange={(e) => handleChange("defaultNextNodeId", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm"
                placeholder="-1"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Default next node ID when not specified
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Default Speech ID
              </label>
              <input
                type="text"
                value={settings.defaultSpeechId}
                onChange={(e) => handleChange("defaultSpeechId", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm"
                placeholder="-1"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Default speech ID when not specified
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Default Speech Speed
              </label>
              <input
                type="text"
                value={settings.defaultSpeechSpeed}
                onChange={(e) => handleChange("defaultSpeechSpeed", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm"
                placeholder="-1"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Default speech speed (1=Fast, 2=Normal, 3=Slow)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Default Action ID
              </label>
              <input
                type="text"
                value={settings.defaultActionId}
                onChange={(e) => handleChange("defaultActionId", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm"
                placeholder="1001"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Default action ID when not specified
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Default Value 1
                </label>
                <input
                  type="text"
                  value={settings.defaultValue1}
                  onChange={(e) => handleChange("defaultValue1", e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm"
                  placeholder="-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Default Value 2
                </label>
                <input
                  type="text"
                  value={settings.defaultValue2}
                  onChange={(e) => handleChange("defaultValue2", e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm"
                  placeholder="-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Default Value 3
                </label>
                <input
                  type="text"
                  value={settings.defaultValue3}
                  onChange={(e) => handleChange("defaultValue3", e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm"
                  placeholder="-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex gap-2 justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-neutral-300 text-neutral-800 rounded-md hover:bg-neutral-400 transition-colors font-medium"
          >
            Reset to Defaults
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-300 text-neutral-800 rounded-md hover:bg-neutral-400 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors font-medium"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
