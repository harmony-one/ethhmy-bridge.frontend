import React, { useCallback } from 'react';
import { Box } from 'grommet';
import * as s from '../StepBASE/StepBASE.styl';
import { Status } from '../Status/Status';
import { Details } from '../../../Exchange/Details';
import { Networks } from '../Networks/Networks';
import cn from 'classnames';
import { Button } from '../../../../components/Base';
import { ethBridgeStore } from '../../EthBridgeStore';
import { useStores } from '../../../../stores';
import { Divider } from '../../../../components/Divider/Divider';
import { StepContainer } from '../StepContainer';

interface Props {}

export const StepRESULT: React.FC<Props> = () => {
  const { exchange } = useStores();

  const handleClickBack = useCallback(() => {
    const conf = exchange.step.buttons[0];
    exchange.onClickHandler(conf.validate, conf.onClick, ethBridgeStore);
  }, [exchange]);

  return (
    <StepContainer>
      <Networks />
      <Divider />
      <Box pad="60px">
        <Details>
          <Status />
        </Details>
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
      </Box>
    </StepContainer>
  );
};

StepRESULT.displayName = 'StepRESULT';
