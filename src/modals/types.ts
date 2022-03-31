import React from 'react';

export enum ModalIds {
  BRIDGE_TOKEN_SETTINGS = 'BRIDGE_TOKEN_SETTINGS',
  BRIDGE_TOKEN_CHOOSE = 'BRIDGE_TOKEN_CHOOSE',
  MODAL_3 = 'modal_3',
}

type LayerProps = {
  layerProps?: { full?: boolean; position?: 'center' };
};

export type InferModalProps<T> = T extends { [key: string]: infer U }
  ? U
  : never;

export type Modals = InferModalProps<ModalMap>;

export type ModalMap = {
  [ModalIds.BRIDGE_TOKEN_SETTINGS]: {
    params: LayerProps & { data: string };
    component: React.ReactNode;
  };
  [ModalIds.BRIDGE_TOKEN_CHOOSE]: {
    params: LayerProps;
    component: React.ReactNode;
  };
  [ModalIds.MODAL_3]: {
    params: LayerProps;
    component: React.ReactNode;
  };
};

// case1: открытие модалки через навигацию +1
// case2: закрытие модалки +1
// case3: открытие по прямой ссылке +1
// case4: закрытие после открытия case4 +1
// case5: проброс параметров через url +1
