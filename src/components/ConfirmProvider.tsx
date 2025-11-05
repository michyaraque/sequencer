"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  showConfirm: (config: ConfirmConfig) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    message: "",
  });
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const showConfirm = useCallback((config: ConfirmConfig): Promise<boolean> => {
    setConfirmConfig(config);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
    setResolvePromise(null);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setResolvePromise(null);
  }, [resolvePromise]);

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={(open) => {
        if (!open) handleCancel();
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmConfig.title || "Confirm Action"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmConfig.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {confirmConfig.cancelText || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {confirmConfig.confirmText || "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
