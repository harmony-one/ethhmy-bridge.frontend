import React from 'react';
import { Modal } from 'semantic-ui-react';
import { TokenInfoRow } from './TokenInfoRow';
import { TokenSelectorButton } from './TokenSelectorButton';
import { AddTokenModal } from './AddTokenModal';
import { GetSnip20Params, Snip20TokenInfo } from '../../../blockchain-bridge';
import { SigningCosmWasmClient } from 'secretjs';
import LocalStorageTokens from '../../../blockchain-bridge/scrt/CustomTokens';
import Loader from 'react-loader-spinner';
import { ClearCustomTokensButton } from './ClearCustomTokens';
import { ExitIcon } from '../../../ui/Icons/ExitIcon';
import { SwapToken, SwapTokenFromSnip20Params } from '../types/SwapToken';

export const TokenSelector = (props: {
  secretjs: SigningCosmWasmClient;
  tokens: SwapToken[];
  token?: SwapToken;
  onClick?: any;
  notify?: CallableFunction;
}) => {
  const [open, setOpen] = React.useState(false);
  const [localToken, setLocalToken] = React.useState<string>('');
  const [localStorageTokens, setLocalStorageToken] = React.useState<SwapToken[]>(null);

  React.useEffect(() => {
    const addToken = async () => {
      if (localToken) {
        const tokenInfo: Snip20TokenInfo = await GetSnip20Params({
          secretjs: props.secretjs,
          address: localToken,
        });

        const customTokenInfo = SwapTokenFromSnip20Params(localToken, tokenInfo);

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
      <Modal.Header>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Select a token</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setOpen(false)}>
            <ExitIcon />
          </span>
        </div>
      </Modal.Header>
      <Modal.Content>
        {props.tokens.length > 0 ? (
          props.tokens
            .sort(a => (a.symbol.toLowerCase().includes('scrt') ? -1 : 1))
            .sort(a => (a.identifier === 'uscrt' ? -1 : 1)) // consider removing if we don't care about scrt, or do this more efficiently?
            .map(t => {
              return (
                <TokenInfoRow
                  key={t.identifier}
                  token={t}
                  onClick={() => {
                    props?.onClick ? props.onClick(t.identifier) : (() => {})();
                    setOpen(false);
                  }}
                />
              );
            })
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Loader type="ThreeDots" color="#00BFFF" height="0.5em" />
          </div>
        )}
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
