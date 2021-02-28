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
import cn from 'classnames';
import * as styles from './styles.styl';

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
  const [searchText, setSearchText] = React.useState<string>('');

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
    addToken().catch(/* todo: add notification of failures */);
  }, [props.secretjs, localToken]);

  const filteredTokens = props.tokens.filter(t => {
    return (t.symbol + String(t.address)).toLowerCase().includes(searchText);
  });

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
          <div style={{ display: 'flex' }}>
            <input
              autoFocus
              className={cn(styles.tokenSelectorSearch)}
              placeholder="Search symbol or paste address"
              onChange={e => setSearchText(e.target.value.trim().toLowerCase())}
            />
          </div>
        ) : null}
        {props.tokens.length > 0 ? (
          filteredTokens.length === 0 ? (
            <div
              style={{ display: 'flex', justifyContent: 'center', fontSize: '16px', fontWeight: 500, padding: '30px' }}
            >
              No results found.
            </div>
          ) : (
            filteredTokens
              .sort((a, b) => {
                /* sSCRT first */
                if (a.symbol === 'sSCRT') {
                  return -1;
                }
                if (b.symbol === 'sSCRT') {
                  return 1;
                }
                /* then sUNILP-WSCRT-ETH ? */
                // if (a.symbol === 'sUNILP-WSCRT-ETH') {
                //   return -1;
                // }
                // if (b.symbol === 'sUNILP-WSCRT-ETH') {
                //   return 1;
                // }

                const aSymbol = a.symbol.replace(/^s/, '');
                const bSymbol = b.symbol.replace(/^s/, '');

                return aSymbol.localeCompare(bSymbol);
              })
              .map(t => {
                return (
                  <TokenInfoRow
                    key={t.identifier}
                    token={t}
                    onClick={() => {
                      props?.onClick ? props.onClick(t.identifier) : (() => {})();
                      setOpen(false);
                      setSearchText('');
                    }}
                  />
                );
              })
          )
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
