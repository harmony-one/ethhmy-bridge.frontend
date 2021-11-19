import React from 'react';
import { Box, Tabs, Tab } from 'grommet';
import { TActionModalProps } from '../../components/ActionModals';
import { observer } from 'mobx-react-lite';
import { SetTxModal } from './SetTxModal';
import { UpdateTxModal } from './UpdateTxModal';

export const ManageTxModal: React.FC<TActionModalProps> = observer((props) => {
  const params = props.actionData.data;

  return (
    <Box pad="large" gap="30px">
      <Tabs>
        <Tab title="Update">
          <Box>
            <UpdateTxModal operation={params.operation} />
          </Box>
        </Tab>
        <Tab title="Set">
          <Box>
            <SetTxModal operation={params.operation} />
          </Box>
        </Tab>
      </Tabs>
    </Box>
  );
});

ManageTxModal.displayName = 'ManageTxModal';
