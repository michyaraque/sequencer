"use client";

import { memo } from "react";
import { CustomNodeProps } from "./shared";
import { BaseDialogNode } from "@/components/nodes/BaseDialogNode";

const DialogNode = memo((props: CustomNodeProps) => (
  <BaseDialogNode
    {...props}
    showTargetHandle={true}
    showSourceHandle={true}
    showSpeech={false}
    accentColor="bg-neutral-50"
    borderColor="border-neutral-300"
    badgeColor="bg-neutral-800"
  />
));

DialogNode.displayName = "DialogNode";

export default DialogNode;
