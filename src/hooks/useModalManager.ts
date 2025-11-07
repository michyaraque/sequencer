import { useState, useCallback } from "react";

type ModalState = Record<string, boolean>;

export function useModalManager(modalNames: string[]) {
  const initialState = modalNames.reduce((acc, name) => {
    acc[name] = false;
    return acc;
  }, {} as ModalState);

  const [modals, setModals] = useState<ModalState>(initialState);

  const openModal = useCallback((name: string) => {
    setModals((prev) => ({ ...prev, [name]: true }));
  }, []);

  const closeModal = useCallback((name: string) => {
    setModals((prev) => ({ ...prev, [name]: false }));
  }, []);

  const toggleModal = useCallback((name: string) => {
    setModals((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const isOpen = useCallback((name: string) => modals[name] || false, [modals]);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    isOpen,
  };
}
