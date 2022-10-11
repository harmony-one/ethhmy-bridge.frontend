import React, { useCallback, useContext } from 'react';
import { useQueryParams } from '../hooks/useQueryString';
import { Layer } from 'grommet';
import { ModalContext } from './ModalContext';
import { ModalIds } from './types';
import { observer } from 'mobx-react';
import { useStores } from '../stores';
import * as s from './Layer.styl';

interface Props {}

export const ModalReactRouter: React.FC<Props> = observer(() => {
  const queryParams = useQueryParams();

  const { routing } = useStores();

  const modalContext = useContext(ModalContext);

  const urlProps = queryParams.modal as Record<string, unknown>;
  const modalId = urlProps && (urlProps.id as ModalIds);

  const modal = modalContext.modalStore.getModal(modalId);

  const handleCloseModal = useCallback(
    (replace = true) => {
      // navigate replace (remove qp)
      // navigate (remove qp)
      // navigate in handle
      routing.closeModal(replace);
    },
    [routing],
  );

  if (!modal || !modal.component) {
    return null;
  }

  const { full = false, position = 'center' } = modal.layerProps || {};

  const modalComponent = React.cloneElement(
    modal.component as React.ReactElement<{
      onClose: () => void;
      urlProps: Record<string, unknown>;
    }>,
    { onClose: handleCloseModal, urlProps: urlProps },
  );

  return (
    <Layer
      onClickOutside={handleCloseModal}
      className={s.layer}
      full={full}
      position={position}
      responsive={false}
    >
      {modalComponent}
    </Layer>
  );
});

ModalReactRouter.displayName = 'ModalReactRouter';
