"use client";

import { memo } from "react";
import { BaseDialogNode } from "./BaseDialogNode";
import { CustomNodeProps } from "./shared";

export const StartSequenceNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={false}
    showSourceHandle={true}
    showSpeech={false}
    showBotId={false}
    accentColor="bg-green-50"
    borderColor="border-green-300"
    badgeColor="bg-green-700"
  />
));

StartSequenceNode.displayName = "StartSequenceNode";
