"use client";

import { memo } from "react";
import { BaseDialogNode } from "./BaseDialogNode";
import { CustomNodeProps } from "./shared";

export const EndDialogueNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={false}
    showSpeech={false}
    showBotId={false}
    accentColor="bg-red-50"
    borderColor="border-red-300"
    badgeColor="bg-red-700"
  />
));

EndDialogueNode.displayName = "EndDialogueNode";
