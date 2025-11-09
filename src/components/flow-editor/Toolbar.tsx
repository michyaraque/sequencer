import { Undo2, Redo2, Trash2, Variable, Download, Copy, Upload, Languages, Save, Menu, MessageSquare, Layers, ListOrdered } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Node } from "@xyflow/react";
import { DialogNodeData } from "@/types/dialog";
import { LANGUAGES } from "@/constants/languages";

interface ToolbarProps {
  selectedLanguage: number;
  onLanguageChange: (language: number) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedNode: Node<DialogNodeData> | null;
  deleteSelectedNode: () => void;
  nodes: Node<DialogNodeData>[];
  onSaveSequence: () => void;
  handleExport: () => void;
  handleExportSpeeches: () => void;
  handleExportChoices: () => void;
  handleCopyToClipboard: () => void;
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showNodeEditor: boolean;
  toggleNodeEditor: () => void;
  onMobileMenuOpen: () => void;
  onMobileNodeEditorOpen: () => void;
}

export function Toolbar({
  selectedLanguage,
  onLanguageChange,
  handleUndo,
  handleRedo,
  canUndo,
  canRedo,
  selectedNode,
  deleteSelectedNode,
  nodes,
  onSaveSequence,
  handleExport,
  handleExportSpeeches,
  handleExportChoices,
  handleCopyToClipboard,
  handleImport,
  showNodeEditor,
  toggleNodeEditor,
  onMobileMenuOpen,
  onMobileNodeEditorOpen,
}: ToolbarProps) {
  const selectedNodesCount = nodes.filter(n => n.selected).length;

  return (
    <div className="bg-white border-b border-neutral-200 px-2 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 overflow-x-auto">
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors"
        title="Menu"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="p-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo2 size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="p-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo2 size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

      <div className="hidden sm:block w-px h-8 bg-neutral-300" />

      <div className="hidden md:flex items-center gap-2">
        <Languages size={18} className="text-neutral-600" />
        <Select
          value={selectedLanguage.toString()}
          onValueChange={(value) => onLanguageChange(parseInt(value))}
        >
          <SelectTrigger className="w-32 lg:w-40">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.id} value={lang.id.toString()}>
                {lang.flag && <span className="mr-2">{lang.flag}</span>}
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {selectedNode && (
          <button
            onClick={deleteSelectedNode}
            className="p-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        )}

        {selectedNodesCount > 1 && (
          <button
            onClick={onSaveSequence}
            className="md:px-2 md:py-1.5 px-3 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700 transition-colors flex items-center gap-2 h-full"
            title="Save Sequence"
          >
            <Save size={16} className="w-[18px] h-[16px]" />
            <span className="hidden sm:inline">Save Sequence</span>
          </button>
        )}
      </div>

      <div className="hidden sm:block w-px h-8 bg-neutral-300 shrink-0" />

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={handleExport}
          className="p-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-800 transition-colors relative cursor-pointer"
          title="Export Nodes"
        >
          <Layers size={18} />
          <Download size={9} className="absolute bottom-1 right-1" />
        </button>

        <button
          onClick={handleExportSpeeches}
          className="p-2 bg-neutral-700 text-white rounded-md hover:bg-indigo-700 transition-colors relative"
          title="Export Speeches"
        >
          <MessageSquare size={18} className="sm:w-[18px] sm:h-[18px]" />
          <Download size={9} className="absolute bottom-1 right-1" />
        </button>
        <button
          onClick={handleExportChoices}
          className="p-2 bg-neutral-700 text-white rounded-md hover:bg-indigo-700 transition-colors relative"
          title="Export Speeches"
        >
          <ListOrdered size={18} className="sm:w-[18px] sm:h-[18px]" />
          <Download size={9} className="absolute bottom-1 right-1" />
        </button>

        {/* <button
          onClick={handleCopyToClipboard}
          className="hidden sm:flex p-2 bg-neutral-500 text-white rounded-md hover:bg-neutral-600 transition-colors"
          title="Copy"
        >
          <Copy size={18} />
        </button> */}

        {/* <label className="p-2 bg-neutral-400 text-white rounded-md hover:bg-neutral-500 transition-colors cursor-pointer inline-flex items-center">
          <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
          <input
            type="file"
            accept=".txt"
            onChange={handleImport}
            className="hidden"
          />
        </label> */}
      </div>

      <button
        onClick={toggleNodeEditor}
        className={`hidden lg:flex ml-auto p-2 rounded-md transition-colors items-center gap-1.5 ${showNodeEditor
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-neutral-300 text-neutral-700 hover:bg-neutral-400'
          }`}
        title={showNodeEditor ? "Hide Properties" : "Show Properties"}
      >
        <Variable size={18} />
        <span className="text-sm font-medium hidden xl:inline">Properties</span>
      </button>

      {selectedNode && (
        <button
          onClick={onMobileNodeEditorOpen}
          className="lg:hidden ml-auto p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          title="Edit Node"
        >
          <Variable size={16} />
        </button>
      )}
    </div>
  );
}
