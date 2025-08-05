import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalStateContext = createContext();

export const useModalState = () => {
  const context = useContext(ModalStateContext);
  if (!context) {
    throw new Error('useModalState must be used within a ModalStateProvider');
  }
  return context;
};

export const ModalStateProvider = ({ children }) => {
  const [openModals, setOpenModals] = useState({
    client: null,
    financial: null,
    workflow: null,
    servicePackage: null,
    equipment: null,
    maintenance: null,
    fixedCost: null,
    goal: null,
    goalTransaction: null,
    withdrawGoal: null,
    orcamento: null,
    formCreation: false,
    formSuccess: null,
    bookingSettings: false,
    availability: null,
  });

  const openModal = useCallback((modalName, modalData = {}) => {
    setOpenModals(prev => ({
      ...prev,
      [modalName]: { isOpen: true, ...modalData },
    }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setOpenModals(prev => ({
      ...prev,
      [modalName]: null,
    }));
  }, []);

  const isAnyModalOpen = Object.values(openModals).some(modalState => modalState?.isOpen);

  const value = {
    openModals,
    openModal,
    closeModal,
    isAnyModalOpen,
  };

  return (
    <ModalStateContext.Provider value={value}>
      {children}
    </ModalStateContext.Provider>
  );
};