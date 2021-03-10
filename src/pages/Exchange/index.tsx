import * as React from 'react';
import { useEffect } from 'react';
import { Box } from 'grommet';
import { inject, observer } from 'mobx-react';
import { IStores } from 'stores';
import { EXCHANGE_STEPS } from '../../stores/Exchange';
import { Base } from './steps/base';
import { ERC20ApprovalModal } from './steps/erc20approval';
import { SwapConfirmation } from './steps/swapConfirmation';
import { CheckTransaction } from './steps/checkTransaction';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import { useStores } from '../../stores';

export const Exchange = observer(() => {


  const { exchange } = useStores();

  return (
    <Box fill direction="column">

      <Base />
      {exchange.step.id === EXCHANGE_STEPS.APPROVE_CONFIRMATION && <ERC20ApprovalModal />}
      {exchange.step.id === EXCHANGE_STEPS.CONFIRMATION && <SwapConfirmation />}
      {exchange.step.id === EXCHANGE_STEPS.CHECK_TRANSACTION && <CheckTransaction />}

    </Box>

  )
}
)
