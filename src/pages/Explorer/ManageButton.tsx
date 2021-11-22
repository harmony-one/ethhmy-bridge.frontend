import * as React from 'react';
import { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '../../components/Base';
import { useStores } from '../../stores';
import { IOperation } from '../../stores/interfaces';
import { Box } from 'grommet';
import { ManageTxModal } from './ManageTxModal';

export const ManageButton = observer((params: { operation: IOperation }) => {
  const { actionModals } = useStores();

  const changeTx = useCallback(() => {
    actionModals.open(ManageTxModal, {
      initData: params,
      title: '',
      applyText: '',
      closeText: 'Close modal',
      noValidation: true,
      width: '500px',
      showOther: true,
      onApply: () => {
        return Promise.resolve();
      },
    });
  }, [actionModals, params]);

  return (
    <Box direction="column" gap="10px">
      <Button
        size="small"
        style={{ float: 'right', marginRight: 15 }}
        onClick={() => {
          changeTx();
        }}
      >
        Manage
      </Button>
    </Box>
  );
});
