import { TokenDisplay } from '../index';
import React, { useEffect } from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { SwapInput } from '../../../components/Swap/SwapInput';
import * as styles from './styles.styl';
import cn from 'classnames';
import { IsValid } from './IsValid';
import { validateBech32Address } from '../../../blockchain-bridge/scrt';
import { Text } from '../../../components/Base/components/Text';

const AddTokenButton = (props: { onClick?: any }) => {
  return (
    <button className={cn(styles.selectATokenButton)} onClick={props.onClick}>
      <Text size="medium">Add custom token</Text>
    </button>
  );
};

export const AddTokenModal = (props: { tokens: TokenDisplay[]; token: TokenDisplay; addToken: any; onClick?: any }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [address, setAddress] = React.useState<string>('');
  const [isValidAddress, setisValidAddress] = React.useState<boolean>(false);

  useEffect(() => {
    setisValidAddress(validateBech32Address(address));
  }, [address]);

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<AddTokenButton />}
      style={{ width: '700px', display: 'flex' }}
    >
      <Modal.Header>Enter Token Address</Modal.Header>
      <Modal.Content>
        <SwapInput value={address} setValue={setAddress} placeholder={'secret1.....'} width={'600px'} />
        <IsValid isValid={isValidAddress} />
      </Modal.Content>
      <Modal.Actions>
        <Button color="grey" onClick={() => setOpen(false)}>
          Nope
        </Button>
        <Button
          content="Add"
          labelPosition="right"
          icon="checkmark"
          onClick={() => {
            props.addToken(address);
            setOpen(false);
          }}
          positive
          disabled={!isValidAddress}
        />
      </Modal.Actions>
    </Modal>
  );
};
