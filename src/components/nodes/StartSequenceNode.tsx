"use client";

import { memo } from "react";
import { CustomNodeProps } from "./shared";
import { Play } from "lucide-react";
import { NodeContainer } from "./NodeContainer";

export const StartSequenceNode = memo((props: CustomNodeProps) => {
  const { data, id, selected } = props;

  return (
    <NodeContainer
      selected={selected}
      color="green"
      icon={<Play size={20} />}
      label={data.label}
      subtitle="Start sequence - initiates sequence"
      showSourceHandle={false}
      showTopBorder={false}
    >
      <></>
    </NodeContainer>
  );
});

StartSequenceNode.displayName = "StartSequenceNode";
