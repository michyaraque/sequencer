import { Node, Edge } from "@xyflow/react";
import { DialogNodeData, SpeechText, NPC, Variable } from "@/types/dialog";

// Full project export/import interfaces
export interface ProjectExport {
  version: string;
  timestamp: string;
  projectName: string;
  nodes: Node<DialogNodeData>[];
  edges: Edge[];
  speechTexts: SpeechText[];
  npcs: NPC[];
  variables: Variable[];
}

// Export entire project to JSON
export function exportProject(
  nodes: Node<DialogNodeData>[],
  edges: Edge[],
  speechTexts: SpeechText[],
  npcs: NPC[],
  variables: Variable[],
  projectName: string = "Untitled Project"
): string {
  const project: ProjectExport = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    projectName,
    nodes,
    edges,
    speechTexts,
    npcs,
    variables,
  };

  return JSON.stringify(project, null, 2);
}

// Import entire project from JSON
export function importProject(content: string): ProjectExport | null {
  try {
    const project: ProjectExport = JSON.parse(content);

    // Validate project structure
    if (!project.nodes || !project.edges || !project.speechTexts || !project.npcs || !project.variables) {
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

export function exportToDialogFormat(nodes: Node<DialogNodeData>[]): string {
  const lines = nodes.map((node, index) => {
    const data = node.data;

    // Replace placeholder values with -1
    const botId = data.botId === "#(bot_id)" ? "-1" : (data.botId || "-1");
    const userId = data.userId === "#(user_id)" ? "-1" : (data.userId || "-1");

    // Format: index=#(bot_id)|#(user_id)|#(next_node_id)|#(text_id)|#(text_speed)|#(action_id)|#(value_1)|#(value_2)|#(value_3)
    return `${index}=${botId}|${userId}|${data.nextNodeId || "-1"}|${data.speechId || "-1"}|${data.speechSpeed || "1/2/3"}|${data.actionId || "1001"}|${data.value1 || "-1"}|${data.value2 || "-1"}|${data.value3 || "-1"}`;
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
    // Parse format: index=#(bot_id)|#(user_id)|#(next_node_id)|#(text_id)|#(text_speed)|#(action_id)|#(value_1)|#(value_2)|#(value_3)
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
    const text = parts.slice(1).join("="); // Rejoin in case text contains =

    // Calculate languageId from the ID
    const numericId = parseInt(id);
    let languageId = 1; // Default to English
    if (numericId >= 400000) languageId = 4; // French
    else if (numericId >= 300000) languageId = 3; // Portuguese
    else if (numericId >= 200000) languageId = 2; // Spanish
    else if (numericId >= 100000) languageId = 1; // English

    return {
      id,
      languageId,
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
