import React from 'react';
import { ModalStore } from './ModalStore';

export const modalStore = new ModalStore();

export const ModalContext = React.createContext({
  modalStore,
});
