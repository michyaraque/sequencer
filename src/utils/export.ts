import { Node, Edge } from "@xyflow/react";
import { DialogNodeData, SpeechText, NPC, Variable, ExportSettings, ExportField, Choice, ChoiceText } from "@/types/dialog";
import { RoomData } from "@/store/useRoomsStore";
import { getLanguageFromSpeechId } from "@/constants/languages";

export function getDefaultExportFields(): ExportField[] {
  return [
    { id: "botId", name: "Bot ID", value: "-1", order: 0 },
    { id: "userId", name: "User ID", value: "$(user_id)", order: 1 },
    { id: "nextNodeId", name: "Next Node ID", value: "-1", order: 2 },
    { id: "speechId", name: "Speech ID", value: "-1", order: 3 },
    { id: "speechSpeed", name: "Node Speed", value: "-1", order: 4 },
    { id: "actionId", name: "Action ID", value: "1", order: 5 },
    { id: "value1", name: "Value 1", value: "-1", order: 6 },
    { id: "value2", name: "Value 2", value: "-1", order: 7 },
    { id: "value3", name: "Value 3", value: "-1", order: 8 },
  ];
}

// Full project export/import interfaces
export interface ProjectExport {
  version: string;
  timestamp: string;
  projectName: string;
  rooms: RoomData[];

  nodes?: Node<DialogNodeData>[];
  edges?: Edge[];
  speechTexts?: SpeechText[];
  npcs?: NPC[];
  variables?: Variable[];
}

// Export entire project to JSON
export function exportProject(
  rooms: RoomData[],
  projectName: string = "Untitled Project"
): string {
  const project: ProjectExport = {
    version: "2.0.0", // Bumped to 2.0.0 for rooms support
    timestamp: new Date().toISOString(),
    projectName,
    rooms,
  };

  return JSON.stringify(project, null, 2);
}

// Import entire project from JSON
export function importProject(content: string): ProjectExport | null {
  try {
    const project: ProjectExport = JSON.parse(content);

    // Handle legacy format (version 1.0.0) - convert to new format
    if (project.nodes && project.edges && !project.rooms) {
      // Convert legacy format to new room-based format
      const legacyRoom: RoomData = {
        id: `room-${Date.now()}`,
        name: "Room 1",
        projectName: project.projectName || "Untitled Project",
        selectedLanguage: 1,
        nodes: project.nodes,
        edges: project.edges,
        speechTexts: project.speechTexts || [],
        npcs: project.npcs || [],
        variables: project.variables || [],
        choices: [],
        choiceTexts: [],
        exportSettings: {
          fields: getDefaultExportFields(),
        },
      };

      project.rooms = [legacyRoom];
    }

    // Ensure all rooms have exportSettings
    if (project.rooms) {
      project.rooms = project.rooms.map(room => ({
        ...room,
        exportSettings: room.exportSettings || {
          fields: getDefaultExportFields(),
        },
      }));
    }

    // Validate project structure (new format)
    if (!project.rooms || !Array.isArray(project.rooms)) {
      throw new Error("Invalid project format");
    }

    return project;
  } catch (error) {
    console.error("Failed to import project:", error);
    return null;
  }
}

// Download project file
export function downloadProjectFile(content: string, filename: string = "dialog-project.json") {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToDialogFormat(
  nodes: Node<DialogNodeData>[],
  exportSettings?: ExportSettings
): string {
  const fields = exportSettings?.fields || getDefaultExportFields();
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const lines = nodes.map((node) => {
    const data = node.data;

    const fieldValues = sortedFields.map((field) => {
      const fieldId = field.id;

      if (fieldId === "botId") {
        return data.botId === "#(bot_id)" ? field.value : (data.botId || field.value);
      }
      if (fieldId === "userId") {
        return data.userId || field.value;
      }
      if (fieldId === "nextNodeId") {
        return data.nextNodeId || field.value;
      }
      if (fieldId === "speechId") {
        return data.speechId || field.value;
      }
      if (fieldId === "speechSpeed") {
        const nodeTypesWithSpeechSpeed = ["botSpeech", "showMessage", "choice"];
        const shouldExportSpeechSpeed = node.type && nodeTypesWithSpeechSpeed.includes(node.type);
        return shouldExportSpeechSpeed ? (data.speechSpeed || field.value) : field.value;
      }
      if (fieldId === "actionId") {
        return data.actionId || field.value;
      }
      if (fieldId === "value1") {
        return data.value1 || field.value;
      }
      if (fieldId === "value2") {
        return data.value2 || field.value;
      }
      if (fieldId === "value3") {
        return data.value3 || field.value;
      }

      return field.value;
    });

    return `${node.id}=${fieldValues.join("¦")}`;
  });

  return lines.join("\n");
}

export function downloadDialogFile(content: string, filename: string = "dialog.txt") {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromDialogFormat(content: string): DialogNodeData[] {
  const lines = content.trim().split("\n");

  return lines.map((line) => {
    // Parse format: index=#(bot_id)|$(user_id)|#(next_node_id)|#(text_id)|#(text_speed)|#(action_id)|#(value_1)|#(value_2)|#(value_3)
    const [, values] = line.split("=");
    const [botId, userId, nextNodeId, speechId, speechSpeed, actionId, value1, value2, value3] = values.split("|");

    return {
      botId: botId || "-1",
      userId: userId || "-1",
      nextNodeId: nextNodeId || "-1",
      speechId: speechId || "-1",
      speechSpeed: speechSpeed || "1/2/3",
      actionId: actionId || "1001",
      value1: value1 || "-1",
      value2: value2 || "-1",
      value3: value3 || "-1",
      label: `Node ${botId}`,
    };
  });
}

export function exportSpeechTexts(speechTexts: SpeechText[]): string {
  const lines = speechTexts.map((st) => {
    // Format: id=text
    return `${st.id}=${st.text}`;
  });

  return lines.join("\n");
}

export function importSpeechTexts(content: string): SpeechText[] {
  if (!content.trim()) return [];

  const lines = content.trim().split("\n");

  return lines.map((line) => {
    const parts = line.split("=");
    const id = parts[0];
    const text = parts.slice(1).join("=");

    const language = getLanguageFromSpeechId(id);

    return {
      id,
      languageId: language.id,
      text,
    };
  });
}

export function downloadSpeechTextsFile(content: string, filename: string = "speech_texts.txt") {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadChoicesFile(content: string, filename: string = "choices.txt") {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import choices from text format
export function importChoices(content: string): Choice[] {
  if (!content.trim()) return [];

  const lines = content.trim().split("\n");
  const choices: Choice[] = [];

  lines.forEach((line) => {
    // Skip comments and empty lines
    if (line.startsWith("#") || !line.trim()) return;

    // Parse format: nodeId¦order¦speechId=text
    const [nodeData, text] = line.split("=");
    if (!nodeData || text === undefined) return;

    const [nodeId, orderStr, speechId] = nodeData.split("¦");
    if (!nodeId || !orderStr || !speechId) return;

    choices.push({
      id: `choice-${nodeId}-${orderStr}`,
      nodeId,
      order: parseInt(orderStr, 10),
      speechId,
      text: text,
    });
  });

  return choices;
}

// Import choice texts from text format
export function importChoiceTexts(content: string): ChoiceText[] {
  if (!content.trim()) return [];

  const lines = content.trim().split("\n");
  const choiceTexts: ChoiceText[] = [];

  lines.forEach((line) => {
    // Skip comments and empty lines
    if (line.startsWith("#") || !line.trim()) return;

    // Parse format: id¦speechId=text
    const [idData, text] = line.split("=");
    if (!idData || text === undefined) return;

    const [id, speechId] = idData.split("¦");
    if (!id || !speechId) return;

    choiceTexts.push({
      id,
      speechId,
      text,
    });
  });

  return choiceTexts;
}
