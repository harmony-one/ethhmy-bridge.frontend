import React, { useContext, useEffect } from 'react';
import { ModalContext } from './ModalContext';
import { ModalIds, Modals } from './types';

interface Props {
  modalId: ModalIds;
  params: Modals['params'];
}

export const ModalRegister: React.FC<Props> = React.memo(
  ({ modalId, params, children }) => {
    const child = React.Children.only(children);
    const context = useContext(ModalContext);
    useEffect(() => {
      const modal = {
        params: params,
        component: child,
      };
      console.log('### add modal', modalId);
      context.modalStore.addModal(modalId, modal);
    }, [child, context.modalStore, modalId, params]);

    useEffect(() => {
      return () => {
        context.modalStore.removeModal(modalId);
      };
    }, [context.modalStore, modalId]);

    return null;
  },
);
