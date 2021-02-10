import React from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { TokenDisplay } from './index';
import { TokenInfoRow } from './TokenInfoRow';
import { TokenSelectorButton } from './TokenSelector/TokenSelectorButton';
import { AddTokenModal } from './TokenSelector/AddTokenModal';
import { GetSnip20Params, Snip20TokenInfo } from '../../blockchain-bridge/scrt';
import { SigningCosmWasmClient } from 'secretjs';
import LocalStorageTokens from '../../blockchain-bridge/scrt/CustomTokens';
import { ClearCustomTokensButton } from './TokenSelector/ClearCustomTokens';

export const TokenSelector = (props: {
  secretjs: SigningCosmWasmClient;
  tokens: TokenDisplay[];
  token?: TokenDisplay;
  onClick?: any;
}) => {
  const [open, setOpen] = React.useState(false);
  const [localToken, setLocalToken] = React.useState<string>('');
  const [localStorageTokens, setLocalStorageToken] = React.useState<Record<string, TokenDisplay>>(null);
  //   JSON.parse(localStorage.getItem('customToken')),
  // );

  React.useEffect(() => {
    const addToken = async () => {
      if (localToken) {
        const tokenInfo: Snip20TokenInfo = await GetSnip20Params({
          secretjs: props.secretjs,
          address: localToken,
        });

        const customTokenInfo: TokenDisplay = {
          symbol: tokenInfo.symbol,
          address: localToken,
          decimals: tokenInfo.decimals,
          logo: '/unknown.png',
        };

        LocalStorageTokens.store(customTokenInfo);
        setLocalStorageToken(LocalStorageTokens.get());
      }
    };
    addToken()
      .catch
      // todo: add notification of failures
      ();
  }, [props.secretjs, localToken]);

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<TokenSelectorButton token={props.token} />}
      style={{ width: '700px' }}
      dimmer={'blurring'}
    >
      <Modal.Header>Select Token</Modal.Header>
      <Modal.Content>
        {props.tokens.map(t => {
          return (
            <TokenInfoRow
              token={t}
              onClick={() => {
                props?.onClick ? props.onClick(t.symbol) : (() => {})();
                setOpen(false);
              }}
            />
          );
        })}
      </Modal.Content>
      <Modal.Actions style={{ display: 'flex' }}>
        <ClearCustomTokensButton />
        <div style={{ width: '700px', justifyContent: 'flex-start' }}>
          <AddTokenModal tokens={props.tokens} token={props.token} addToken={address => setLocalToken(address)} />
        </div>
      </Modal.Actions>
    </Modal>
  );
};
