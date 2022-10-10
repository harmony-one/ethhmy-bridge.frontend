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
import { ModalIds, ModalRegister } from '../../../../modals';
import { CustomTokenModal } from '../CustomTokenModal/CustomTokenModal';
import { TokenChooseModal } from '../TokenChooseModal/TokenChooseModal';
import { autorun } from 'mobx';
import { TOKEN } from '../../../../stores/interfaces';
import styled from 'styled-components';

const Container = styled(Box)`
  width: 580px;
  border-radius: 25px;
  background-color: ${props => props.theme.bridgeForm.bgColor};
  overflow: hidden;
`;

interface Props {}

export const StepBASE: React.FC<Props> = observer(() => {
  const { exchange, bridgeFormStore } = useStores();

  const handleClickReset = useCallback(() => {
    exchange.clear();
  }, [exchange]);

  const handleClickContinue = useCallback(() => {
    // const conf = exchange.step.buttons[0];
    // exchange.onClickHandler(conf.validate, conf.onClick, ethBridgeStore);

    bridgeFormStore.goToApproveState();
  }, [bridgeFormStore]);

  useEffect(() => {
    autorun(() => {
      if (exchange.token && exchange.mode && exchange.network) {
        if (ethBridgeStore.formRef) {
          ethBridgeStore.formRef.resetTouched();
          ethBridgeStore.formRef.resetErrors();
          ethBridgeStore.addressValidationError = '';
        }

        if (
          exchange.token === TOKEN.ERC721 ||
          exchange.token === TOKEN.HRC721
        ) {
          exchange.transaction.amount = ['0'];
        } else {
          // debugger;
          // exchange.transaction.amount = '';
        }

        if (
          exchange.token === TOKEN.ERC1155 ||
          exchange.token === TOKEN.HRC1155
        ) {
          exchange.transaction.hrc1155TokenId = '0';
        }
      }
    });
  }, []);

  return (
    <Container margin={{ top: '12px' }}>
      <NetworkRow />
      <Divider />
      <Box pad={{ vertical: '20px' }}>
        <TokenRow />
      </Box>
      <Divider />
      <Box align="center" pad={{ vertical: '20px', horizontal: '20px' }}>
        <Destination />
      </Box>
      <Box direction="row" height="66px">
        {/*<Button*/}
        {/*  fontSize="14px"*/}
        {/*  className={s.buttonContainer}*/}
        {/*  buttonClassName={cn(s.bridgeButton, s.reset)}*/}
        {/*  onClick={handleClickReset}*/}
        {/*>*/}
        {/*  Reset Bridge*/}
        {/*</Button>*/}
        <Button
          fontSize="14px"
          className={s.buttonContainer}
          buttonClassName={s.bridgeButton}
          onClick={handleClickContinue}
        >
          Continue
        </Button>
      </Box>
      <ModalRegister
        layerProps={{ position: 'top' }}
        modalId={ModalIds.BRIDGE_CUSTOM_TOKEN}
      >
        <CustomTokenModal />
      </ModalRegister>
      <ModalRegister
        modalId={ModalIds.BRIDGE_TOKEN_CHOOSE}
        layerProps={{ full: 'vertical' }}
      >
        <TokenChooseModal />
      </ModalRegister>
    </Container>
  );
});

StepBASE.displayName = 'StepBASE';
