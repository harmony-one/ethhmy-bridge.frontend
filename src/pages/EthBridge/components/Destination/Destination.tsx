import React, { useCallback, useEffect, useState } from 'react';
import { WalletButton } from '../../WalletButton';
import { useStores } from '../../../../stores';
import { Box } from 'grommet/components/Box';
import { Icon, Text } from '../../../../components/Base';
import { Button } from 'grommet/components/Button';
import * as s from './Destination.styl';
import { observer } from 'mobx-react';
import { truncateAddressString } from '../../../../utils';
import { ethBridgeStore } from '../../EthBridgeStore';
import { Form, Input, isRequired } from 'components/Form';
import cn from 'classnames';
import { EXCHANGE_MODE } from '../../../../stores/interfaces';

interface MetamaskButtonProps {
  label: string;
  onClick: () => void;
}

const MetamaskButton: React.FC<MetamaskButtonProps> = ({ label, onClick }) => {
  return (
    <Button className={s.metamaskButton} onClick={onClick}>
      <Box direction="row" gap="8px" align="center">
        <Box>
          <img src="/metamask.svg" height="16" />
        </Box>
        <Text color="NWhite" size="xxsmall" lh="24px">
          {label}
        </Text>
        <Icon glyph="CloseCircle" />
      </Box>
    </Button>
  );
};

interface Props {}

export const Destination: React.FC<Props> = observer(() => {
  const { userMetamask, user, exchange } = useStores();

  const handleClickLogoutEth = useCallback(() => {
    userMetamask.signOut();
  }, [userMetamask]);

  const handleClickLogoutHarmony = useCallback(() => {
    user.signOut();
  }, [user]);

  const [formRef, setFormRef] = useState();

  useEffect(() => {
    if (formRef) {
      ethBridgeStore.formRefStepBASEAddress = formRef;
    }
  }, [formRef]);

  let addressValidationError = '';

  const inputName =
    exchange.mode === EXCHANGE_MODE.ONE_TO_ETH ? 'ethAddress' : 'oneAddress';

  return (
    <Form ref={ref => setFormRef(ref)} data={exchange.transaction}>
      <Box direction="column" align="center" gap="8px">
        <Text color="NGray" size="xsmall">
          Destination address
        </Text>

        {/*{userMetamask.isAuthorized && (*/}
        {/*  <Text>{truncateAddressString(userMetamask.ethAddress)}</Text>*/}
        {/*)}*/}

        <Input
          className={cn(s.input)}
          label=""
          bgColor="transparent"
          border="none"
          name={inputName}
          style={{ width: '100%' }}
          placeholder="Receiver address"
          rules={[isRequired]}
          onChange={() => (ethBridgeStore.addressValidationError = '')}
        />

        {ethBridgeStore.addressValidationError && (
          <Text color="red">{ethBridgeStore.addressValidationError}</Text>
        )}

        <Box direction="row" gap="16px">
          {userMetamask.isAuthorized && (
            <MetamaskButton
              label="Eth network"
              onClick={handleClickLogoutEth}
            />
          )}

          {!userMetamask.isAuthorized && (
            <WalletButton
              onClick={() => {
                userMetamask.signIn();
              }}
              error={userMetamask.error}
            >
              <img
                src="/metamask.svg"
                style={{ marginRight: 15, height: 22 }}
              />
              Eth: Metamask
            </WalletButton>
          )}

          {user.isAuthorized && (
            <MetamaskButton
              label="One network"
              onClick={handleClickLogoutHarmony}
            />
          )}

          {!user.isAuthorized && (
            <WalletButton
              onClick={() => {
                user.signInMetamask();
              }}
              error={user.error}
            >
              <img
                src="/metamask.svg"
                style={{ marginRight: 15, height: 22 }}
              />
              One: Metamask
            </WalletButton>
          )}
        </Box>
      </Box>
    </Form>
  );
});

Destination.displayName = 'Destination';
