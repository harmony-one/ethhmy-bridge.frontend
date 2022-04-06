import React, { useCallback } from 'react';
import * as s from './StepBASE.styl';
import { NetworkRow } from '../NetworkRow/NetworkRow';
import { TokenRow } from '../TokenRow/TokenRow';
import { Box } from 'grommet';
import { Destination } from '../Destination/Destination';
import { Button } from '../../../../components/Base';
import cn from 'classnames';
import { ethBridgeStore } from '../../EthBridgeStore';
import { useStores } from '../../../../stores';
import { observer } from 'mobx-react';

interface Props {}

export const StepBASE: React.FC<Props> = observer(() => {
  const { exchange } = useStores();
  const handleClickContinue = useCallback(() => {
    const conf = exchange.step.buttons[0];
    exchange.onClickHandler(conf.validate, conf.onClick, ethBridgeStore);
  }, [exchange]);

  return (
    <Box className={s.root} margin={{ top: '60px' }}>
      <NetworkRow />
      <TokenRow />
      <Box align="center" pad="large" style={{ height: '174px' }}>
        <Destination />
      </Box>
      <Box direction="row" height="66px">
        <Button
          fontSize="14px"
          className={s.buttonContainer}
          buttonClassName={cn(s.bridgeButton, s.reset)}
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
