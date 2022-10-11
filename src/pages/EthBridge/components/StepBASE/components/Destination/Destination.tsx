import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { useStores } from '../../../../../../stores';
import { Box } from 'grommet/components/Box';
import { Icon, Text } from '../../../../../../components/Base';
import { Button } from 'grommet/components/Button';
import * as s from './Destination.styl';
import { observer } from 'mobx-react';
import { ethBridgeStore } from '../../../../EthBridgeStore';
import { Input, isRequired, isValidEthAddress } from 'components/Form';
import cn from 'classnames';
import {
  EXCHANGE_MODE,
  NETWORK_TYPE,
} from '../../../../../../stores/interfaces';
import { NETWORK_NAME } from '../../../../../../stores/names';
import { getChainName } from '../../../../../../stores/Exchange/helpers';
import { BridgeControl } from '../../../BridgeControl/BridgeControl';
import { CircleQuestion, StatusWarning } from 'grommet-icons';
import { Tip } from 'grommet/components/Tip';
import { ThemeContext } from '../../../../../../themes/ThemeContext';
import styled from 'styled-components';
import { TipContent } from 'components/TipContent';

interface MetamaskButtonProps {
  active: boolean;
  onClick: () => void;
}

const MetamaskButton: React.FC<MetamaskButtonProps> = ({ active, onClick }) => {
  return (
    <Button
      className={cn(s.metamaskButton, { [s.active]: active })}
      onClick={onClick}
    >
      <Box direction="row" gap="8px" align="center">
        <Box>
          <img src="/metamask-fox-wordmark-horizontal.svg" height="42" />
        </Box>
        {/*<Text color="NWhite" size="xxsmall" lh="24px">*/}
        {/*  {label}*/}
        {/*</Text>*/}
        {/*{active && <Icon glyph="CloseCircle" />}*/}
        {/*{!active && <Icon glyph="AddCircle" />}*/}
      </Box>
    </Button>
  );
};

interface Props {}

export const Destination: React.FC<Props> = observer(() => {
  const { userMetamask, exchange, bridgeFormStore } = useStores();

  const handleClickMetamask = useCallback(() => {
    if (userMetamask.isAuthorized) {
      // return userMetamask.signOut();
    }

    return userMetamask.signIn();
  }, [userMetamask]);

  const handleClickUseMyAddress = useCallback(() => {
    // exchange.setDestinationAddressByMode(userMetamask.ethAddress);

    bridgeFormStore.setAddress(userMetamask.ethAddress);
  }, [bridgeFormStore, userMetamask.ethAddress]);

  // const inputName =
  //   exchange.mode === EXCHANGE_MODE.ONE_TO_ETH ? 'ethAddress' : 'oneAddress';
  const inputName = 'address';

  const externalNetworkName = NETWORK_NAME[exchange.network];

  const metamaskChainName = useMemo(() => {
    return getChainName(userMetamask.metamaskChainId);
  }, [userMetamask.metamaskChainId]);

  const externalSubNetworkName =
    exchange.network === NETWORK_TYPE.ETHEREUM
      ? process.env.NETWORK === 'mainnet'
        ? 'mainnet'
        : 'kovan'
      : process.env.NETWORK === 'mainnet'
      ? 'mainnet'
      : 'testnet';

  const themeContext = useContext(ThemeContext);

  const tipRef = useRef<HTMLDivElement>();
  return (
    <Box direction="column" align="center" gap="16px" fill="horizontal">
      <BridgeControl
        title={
          <Box ref={ref => (tipRef.current = ref)} direction="row" gap="4px">
            <Text size="xsmall" color="NGray">
              Destination address
            </Text>
            <Tip
              dropProps={{ align: { bottom: 'top' }, target: tipRef.current }}
              plain
              content={
                <TipContent round="7px" pad="xsmall">
                  <Text size="xsmall">
                    Only use your wallet address, never use contract address
                  </Text>
                </TipContent>
              }
            >
              <CircleQuestion size="12px" />
            </Tip>
          </Box>
        }
        gap="8px"
        centerContent={
          <Input
            align="center"
            className={cn({
              [s.inputWrapperDark]: themeContext.isDark(),
              [s.inputWrapperLight]: !themeContext.isDark(),
            })}
            border="none"
            label=""
            bgColor="transparent"
            name={inputName}
            style={{ width: '100%', padding: '0' }}
            placeholder="Receiver address"
            rules={[isRequired, isValidEthAddress('Invalid address')]}
            onChange={() => (ethBridgeStore.addressValidationError = '')}
          />
        }
        bottomContent={
          <Button color="NBlue" onClick={handleClickUseMyAddress}>
            <Text size="xxsmall" color="NBlue">
              Use my address
            </Text>
          </Button>
        }
      />

      {ethBridgeStore.addressValidationError && (
        <Text align="center" color="red">
          {ethBridgeStore.addressValidationError}
        </Text>
      )}

      <Box direction="column" gap="16px" justify="center" align="center">
        <MetamaskButton
          active={userMetamask.isAuthorized}
          onClick={handleClickMetamask}
        />
        {userMetamask.isAuthorized && !userMetamask.isNetworkActual && (
          <Box direction="row" gap="xsmall" align="center">
            <StatusWarning color="#FF0000" />
            <Text size="xsmall">
              You have authorised with MetaMask, but the selected network does
              not match{' '}
              <span style={{ color: 'rgb(0, 173, 232)' }}>
                {externalNetworkName}: {externalSubNetworkName}
              </span>
              . Please change network to {externalSubNetworkName} for transfer{' '}
              {externalNetworkName} -> Harmony with MetaMask.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
});

Destination.displayName = 'Destination';
