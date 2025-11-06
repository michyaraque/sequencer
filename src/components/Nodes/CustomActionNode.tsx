"use client";

import { memo } from "react";
import { BaseDialogNode } from "./BaseDialogNode";
import { CustomNodeProps } from "./shared";

export const CustomActionNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    showSpeech={false}
    showBotId={false}
    accentColor="bg-amber-50"
    borderColor="border-amber-300"
    badgeColor="bg-amber-700"
  />
));

CustomActionNode.displayName = "CustomActionNode";
