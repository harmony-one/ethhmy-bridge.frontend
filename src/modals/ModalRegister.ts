import React, { useContext, useEffect } from 'react';
import { ModalContext } from './ModalContext';
import { LayerProps, ModalIds, Modals } from './types';

interface Props {
  modalId: ModalIds;
  params?: Modals['params'];
  layerProps?: LayerProps;
}

export const ModalRegister: React.FC<Props> = React.memo(
  ({ modalId, params, layerProps, children }) => {
    const component = React.Children.only(children);
    const context = useContext(ModalContext);
    useEffect(() => {
      const modalData = {
        params,
        layerProps,
        component,
      };
      context.modalStore.addModal(modalId, modalData);
    }, [component, context.modalStore, layerProps, modalId, params]);

    useEffect(() => {
      return () => {
        context.modalStore.removeModal(modalId);
      };
    }, [context.modalStore, modalId]);

    return null;
  },
);
