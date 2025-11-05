"use client";

import { useState, useRef, useCallback } from "react";
import { SpeechText, FORMATTING_TAGS, LANGUAGE_PREFIXES } from "@/types/dialog";
import { useAlert } from "@/components/AlertProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SpeechTextEditorProps {
  speechText: SpeechText | null;
  onSave: (speechText: SpeechText) => void;
  onCancel: () => void;
  existingIds: string[];
}

export default function SpeechTextEditor({
  speechText,
  onSave,
  onCancel,
  existingIds,
}: SpeechTextEditorProps) {
  const [label, setLabel] = useState(speechText?.label || "");
  const [text, setText] = useState(speechText?.text || "");
  const [languageId, setLanguageId] = useState(speechText?.languageId || 1);
  const [localId, setLocalId] = useState(
    speechText ? parseInt(speechText.id) - LANGUAGE_PREFIXES[speechText.languageId as keyof typeof LANGUAGE_PREFIXES] : 1
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { showAlert } = useAlert();

  const applyFormatting = useCallback((tag: keyof typeof FORMATTING_TAGS) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    if (selectedText) {
      const { open, close } = FORMATTING_TAGS[tag];
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = `${before}${open}${selectedText}${close}${after}`;

      setText(newText);

      // Restore focus and selection
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + open.length, end + open.length);
      }, 0);
    }
  }, [text]);

  const handleSave = () => {
    if (!label.trim() || !text.trim()) {
      showAlert({ message: "Label and text are required!", variant: "error" });
      return;
    }

    const fullId = LANGUAGE_PREFIXES[languageId as keyof typeof LANGUAGE_PREFIXES] + localId;
    const newSpeechText: SpeechText = {
      id: fullId.toString(),
      languageId,
      text: text.trim(),
      label: label.trim(),
    };

    // Check if ID already exists (and it's not the current one being edited)
    if (existingIds.includes(newSpeechText.id) && speechText?.id !== newSpeechText.id) {
      showAlert({ message: `Speech ID ${newSpeechText.id} already exists!`, variant: "error" });
      return;
    }

    onSave(newSpeechText);
  };

  const renderPreview = () => {
    let preview = text;

    // Replace tags with HTML for preview
    preview = preview.replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>');
    preview = preview.replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>');
    preview = preview.replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>');
    preview = preview.replace(/\[blue\](.*?)\[\/blue\]/g, '<span style="color: #3b82f6">$1</span>');
    preview = preview.replace(/\[cyan\](.*?)\[\/cyan\]/g, '<span style="color: #06b6d4">$1</span>');
    preview = preview.replace(/\[purple\](.*?)\[\/purple\]/g, '<span style="color: #a855f7">$1</span>');
    preview = preview.replace(/\[red\](.*?)\[\/red\]/g, '<span style="color: #ef4444">$1</span>');

    return preview;
  };

  const fullSpeechId = LANGUAGE_PREFIXES[languageId as keyof typeof LANGUAGE_PREFIXES] + localId;

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold text-neutral-800">
        {speechText ? "Edit Speech Text" : "New Speech Text"}
      </h3>

      <div className="space-y-4">
        {/* Speech ID */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Language
            </label>
            <Select
              value={languageId.toString()}
              onValueChange={(value) => setLanguageId(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 (100000) (English)</SelectItem>
                <SelectItem value="2">2 (200000) (Spanish)</SelectItem>
                <SelectItem value="3">3 (300000) (Portuguesse)</SelectItem>
                <SelectItem value="4">4 (400000) (French)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Local ID
            </label>
            <input
              type="number"
              value={localId}
              onChange={(e) => setLocalId(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono"
              min={0}
            />
          </div>
        </div>

        <div className="bg-neutral-800 text-white px-3 py-2 rounded text-sm font-mono">
          Full Speech ID: {fullSpeechId}
        </div>

        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Label (Display Name)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
            placeholder="e.g., Greeting 1"
          />
        </div>

        {/* Formatting Tools */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Formatting Tools
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={() => applyFormatting("bold")}
              className="px-3 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-800 font-bold text-sm"
              title="Bold [b][/b]"
            >
              B
            </button>
            <button
              onClick={() => applyFormatting("underline")}
              className="px-3 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-800 underline text-sm"
              title="Underline [u][/u]"
            >
              U
            </button>
            <button
              onClick={() => applyFormatting("italic")}
              className="px-3 py-1 bg-neutral-700 text-white rounded hover:bg-neutral-800 italic text-sm"
              title="Italic [i][/i]"
            >
              I
            </button>
            <div className="w-px bg-neutral-300" />
            <button
              onClick={() => applyFormatting("blue")}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              title="Blue [blue][/blue]"
            >
              Blue
            </button>
            <button
              onClick={() => applyFormatting("cyan")}
              className="px-3 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600 text-sm"
              title="Cyan [cyan][/cyan]"
            >
              Cyan
            </button>
            <button
              onClick={() => applyFormatting("purple")}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
              title="Purple [purple][/purple]"
            >
              Purple
            </button>
            <button
              onClick={() => applyFormatting("red")}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              title="Red [red][/red]"
            >
              Red
            </button>
          </div>
          <p className="text-xs text-neutral-500 mb-2">
            Select text in the editor below and click a button to apply formatting
          </p>
        </div>

        {/* Text Editor */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Text Content
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white font-mono text-sm"
            rows={6}
            placeholder="Enter your dialog text here..."
          />
        </div>

        {/* Preview */}
        {text && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Preview
            </label>
            <div
              className="w-full px-3 py-2 border border-neutral-200 rounded-md bg-neutral-50 min-h-[100px]"
              dangerouslySetInnerHTML={{ __html: renderPreview() }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-neutral-200">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors font-medium"
        >
          Save Speech Text
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-neutral-300 text-neutral-800 rounded-md hover:bg-neutral-400 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
