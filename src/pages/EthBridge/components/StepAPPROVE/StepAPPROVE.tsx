import React, { useCallback } from 'react';
import { ApproveAmountField } from '../../../Exchange/ApproveAmountField';
import { observer } from 'mobx-react';
import { useStores } from '../../../../stores';
import { Box } from 'grommet';
import * as s from '../StepBASE/StepBASE.styl';
import { Button } from '../../../../components/Base';
import cn from 'classnames';
import { ethBridgeStore } from '../../EthBridgeStore';

interface Props {}

export const StepAPPROVE: React.FC<Props> = observer(() => {
  const { exchange } = useStores();

  const handleClickBack = useCallback(() => {
    const conf = exchange.step.buttons[0];
    exchange.onClickHandler(conf.validate, conf.onClick, ethBridgeStore);
  }, [exchange]);

  const handleClickContinue = useCallback(() => {
    const conf = exchange.step.buttons[1];
    exchange.onClickHandler(conf.validate, conf.onClick, ethBridgeStore);
  }, [exchange]);

  return (
    <Box className={s.root} margin={{ top: '60px' }}>
      <Box pad="60px">
        <ApproveAmountField tokenInfo={exchange.tokenInfo} />
      </Box>

      <Box direction="row" height="66px">
        <Button
          fontSize="14px"
          className={s.buttonContainer}
          buttonClassName={cn(s.bridgeButton, s.reset)}
          onClick={handleClickBack}
        >
          Back
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

StepAPPROVE.displayName = 'StepAPPROVE';
