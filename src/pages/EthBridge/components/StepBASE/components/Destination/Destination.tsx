import React, { useCallback, useMemo } from 'react';
import { useStores } from '../../../../../../stores';
import { Box } from 'grommet/components/Box';
import { Icon, Text } from '../../../../../../components/Base';
import { Button } from 'grommet/components/Button';
import * as s from './Destination.styl';
import { observer } from 'mobx-react';
import { ethBridgeStore } from '../../../../EthBridgeStore';
import { Input, isRequired } from 'components/Form';
import cn from 'classnames';
import {
  EXCHANGE_MODE,
  NETWORK_TYPE,
} from '../../../../../../stores/interfaces';
import { NETWORK_NAME } from '../../../../../../stores/names';
import { getChainName } from '../../../../../../stores/Exchange/helpers';
import { BridgeControl } from '../../../BridgeControl/BridgeControl';

interface MetamaskButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

const MetamaskButton: React.FC<MetamaskButtonProps> = ({
  active,
  label,
  onClick,
}) => {
  return (
    <Button
      className={cn(s.metamaskButton, { [s.active]: active })}
      onClick={onClick}
    >
      <Box direction="row" gap="8px" align="center">
        <Box>
          <img src="/metamask.svg" height="16" />
        </Box>
        <Text color="NWhite" size="xxsmall" lh="24px">
          {label}
        </Text>
        {active && <Icon glyph="CloseCircle" />}
        {!active && <Icon glyph="AddCircle" />}
      </Box>
    </Button>
  );
};

interface Props {}

export const Destination: React.FC<Props> = observer(() => {
  const { userMetamask, user, exchange } = useStores();

  const handleClickMetamask = useCallback(() => {
    if (userMetamask.isAuthorized) {
      return userMetamask.signOut();
    }

    return userMetamask.signIn();
  }, [userMetamask]);

  const handleClickUseMyAddress = useCallback(() => {
    exchange.setDestinationAddressByMode(userMetamask.ethAddress);
  }, [exchange, userMetamask.ethAddress]);

  const inputName =
    exchange.mode === EXCHANGE_MODE.ONE_TO_ETH ? 'ethAddress' : 'oneAddress';

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

  return (
    <Box direction="column" align="center" gap="16px" fill="horizontal">
      <BridgeControl
        title="Destination address"
        gap="8px"
        centerContent={
          <Input
            align="center"
            className={cn(s.input)}
            label=""
            bgColor="transparent"
            border="none"
            name={inputName}
            style={{ width: '100%', padding: '0' }}
            placeholder="Receiver address"
            rules={[isRequired]}
            onChange={() => (ethBridgeStore.addressValidationError = '')}
          />
        }
        bottomContent={
          <Button color="NBlue" onClick={handleClickUseMyAddress}>
            <Text size="xxsmall" color="NBlue">
              use my address
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
          label={metamaskChainName || 'Metamask'}
          onClick={handleClickMetamask}
        />
        {userMetamask.isAuthorized && !userMetamask.isNetworkActual && (
          <Box width="50%">
            <Text size="xsmall">
              You have authorised with Metamask, but the selected network does
              not match{' '}
              <span style={{ color: 'rgb(0, 173, 232)' }}>
                {externalNetworkName}: {externalSubNetworkName}
              </span>
              . Please change network to {externalSubNetworkName} for transfer{' '}
              {externalNetworkName} -> Harmony with Metamask.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
});

Destination.displayName = 'Destination';
