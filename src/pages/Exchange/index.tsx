import * as React from 'react';
import { Box } from 'grommet';
import { inject, observer } from 'mobx-react';
import { IStores } from 'stores';
import { EXCHANGE_STEPS } from '../../stores/Exchange';
import { Base } from './steps/base';
import { ERC20ApprovalModal } from './steps/erc20approval';
import { SwapConfirmation } from './steps/swapConfirmation';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';

@inject('user', 'exchange', 'actionModals', 'userMetamask', 'routing')
@observer
export class Exchange extends React.Component<Pick<IStores, 'exchange'>> {

  constructor(props) {
    super(props);
    this.state = {
      modal: false,
    };
  }

  render() {
    const { exchange } = this.props;

    return (
      <Box fill direction="column">

        <Base />
        {exchange.step.id === EXCHANGE_STEPS.APPROVE_CONFIRMATION && <ERC20ApprovalModal />}
        {exchange.step.id === EXCHANGE_STEPS.CONFIRMATION && <SwapConfirmation />}

      </Box>

    )
  }
}
