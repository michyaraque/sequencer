"use client";

import { memo } from "react";
import { BaseDialogNode } from "./BaseDialogNode";
import { CustomNodeProps } from "./shared";

export const ChoiceNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    showSpeech={false}
    showBotId={false}
    accentColor="bg-cyan-50"
    borderColor="border-cyan-300"
    badgeColor="bg-cyan-700"
  />
));

ChoiceNode.displayName = "ChoiceNode";
