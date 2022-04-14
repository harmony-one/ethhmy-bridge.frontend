import React, { useCallback, useEffect } from 'react';
import * as s from './StepBASE.styl';
import { NetworkRow } from './components/NetworkRow/NetworkRow';
import { TokenRow } from './components/TokenRow/TokenRow';
import { Box } from 'grommet';
import { Destination } from './components/Destination/Destination';
import { Button } from '../../../../components/Base';
import cn from 'classnames';
import { ethBridgeStore } from '../../EthBridgeStore';
import { useStores } from '../../../../stores';
import { observer } from 'mobx-react';
import { Divider } from '../../../../components/Divider/Divider';

interface Props {}

export const StepBASE: React.FC<Props> = observer(() => {
  const { exchange } = useStores();

  const handleClickReset = useCallback(() => {
    // const conf = exchange.step.buttons[1];
    console.log('### reset bridge data');
  }, []);

  const handleClickContinue = useCallback(() => {
    const conf = exchange.step.buttons[0];
    exchange.onClickHandler(conf.validate, conf.onClick, ethBridgeStore);
  }, [exchange]);

  return (
    <Box className={s.root} margin={{ top: '60px' }}>
      <NetworkRow />
      <Divider />
      <Box pad={{ vertical: '40px' }}>
        <TokenRow />
      </Box>
      <Divider />
      <Box align="center" pad={{ vertical: '40px' }}>
        <Destination />
      </Box>
      <Box direction="row" height="66px">
        <Button
          fontSize="14px"
          className={s.buttonContainer}
          buttonClassName={cn(s.bridgeButton, s.reset)}
          onClick={handleClickReset}
        >
          Reset Bridge
        </Button>
        <Button
          fontSize="14px"
          className={s.buttonContainer}
          buttonClassName={s.bridgeButton}
          onClick={handleClickContinue}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
});

StepBASE.displayName = 'StepBASE';
