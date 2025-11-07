import { ReactElement } from "react";

interface ManagerConfig {
  isOpen: boolean;
  Component: React.ComponentType<any>;
  props: Record<string, any>;
  onClose: () => void;
}

interface ManagersRendererProps {
  managers: ManagerConfig[];
}

export function ManagersRenderer({ managers }: ManagersRendererProps) {
  return (
    <>
      {managers.map((manager, index) => {
        if (!manager.isOpen) return null;

        const { Component, props, onClose } = manager;

        return (
          <Component
            key={index}
            {...props}
            onClose={onClose}
          />
        );
      })}
    </>
  );
}
