"use client";

import { memo } from "react";
import { CustomNodeProps } from "./shared";
import { OctagonX, XCircle } from "lucide-react";
import { NodeContainer } from "./NodeContainer";

export const EndSequenceNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;

  return (
    <NodeContainer
      selected={selected}
      color="red"
      icon={<OctagonX size={20} />}
      label={data.label}
      subtitle="End the sequence - no further connections"
      showTargetHandle={false}
      showTopBorder={false}
    >
      <></>
    </NodeContainer>
  );
});

EndSequenceNode.displayName = "EndSequenceNode";
