import { Node } from "@xyflow/react";
import { DialogNodeData, SpeechText } from "@/types/dialog";

export function exportToDialogFormat(nodes: Node<DialogNodeData>[]): string {
  const lines = nodes.map((node, index) => {
    const data = node.data;

    // Format: index=#(bot_id)|#(user_id)|#(next_node_id)|#(text_id)|#(text_speed)|#(action_id)|#(value_1)|#(value_2)|#(value_3)
    return `${index}=${data.botId || "-1"}|${data.userId || "-1"}|${data.nextNodeId || "-1"}|${data.speechId || "-1"}|${data.speechSpeed || "1/2/3"}|${data.actionId || "1001"}|${data.value1 || "-1"}|${data.value2 || "-1"}|${data.value3 || "-1"}`;
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
    // Format: id|languageId|label|text   ${st.languageId}|${st.label}|
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
    const languageId = parseInt(parts[1]);
    const label = parts[2];
    const text = parts.slice(3).join("|"); // Rejoin in case text contains |

    return {
      id,
      languageId,
      label,
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
