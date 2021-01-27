import React from 'react';
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { useStores } from 'stores';
import './override.css';
import { divDecimals } from 'utils';
import { NativeToken, Token } from './trade';
import { SigningCosmWasmClient } from 'secretjs';
import Style from 'style-it';
import { UserStoreEx } from 'stores/UserStore';
import { observer } from 'mobx-react';
import { SwapTab } from './SwapTab';

export type Pair = {
  asset_infos: Array<NativeToken | Token>;
  contract_addr: string;
  liquidity_token: string;
  token_code_hash: string;
};

export type TokenDisplay = {
  symbol: string;
  logo: string;
  decimals: number;
  address?: string;
  token_code_hash?: string;
};

export const ERROR_WRONG_VIEWING_KEY = 'Wrong viewing key used';

export async function getBalance(
  symbol: string,
  walletAddress: string,
  tokens: {
    [symbol: string]: TokenDisplay;
  },
  viewingKey: string,
  userStore: UserStoreEx,
  secretjs: SigningCosmWasmClient,
): Promise<number | JSX.Element> {
  if (symbol === 'SCRT') {
    return secretjs.getAccount(walletAddress).then(account => {
      try {
        return Number(
          divDecimals(account.balance[0].amount, tokens[symbol].decimals),
        );
      } catch (error) {
        return 0;
      }
    });
  }

  const unlockJsx = Style.it(
    `.view-token-button {
      cursor: pointer;
      border-radius: 30px;
      padding: 0 0.3em;
      border: solid;
      border-width: thin;
      border-color: whitesmoke;
    }

    .view-token-button:hover {
      background: whitesmoke;
    }`,
    <span
      className="view-token-button"
      onClick={async () => {
        await userStore.keplrWallet.suggestToken(
          userStore.chainId,
          tokens[symbol].address,
        );
        // TODO trigger balance refresh if this was an "advanced set" that didn't
        // result in an on-chain transaction
      }}
    >
      🔍 View
    </span>,
  );

  if (!viewingKey) {
    return unlockJsx;
  }

  const result = await secretjs.queryContractSmart(tokens[symbol].address, {
    balance: {
      address: walletAddress,
      key: viewingKey,
    },
  });

  if (viewingKey && 'viewing_key_error' in result) {
    // TODO handle this
    return (
      <strong
        style={{
          marginLeft: '0.2em',
          color: 'red',
        }}
      >
        {ERROR_WRONG_VIEWING_KEY}
      </strong>
    );
  }

  try {
    return Number(divDecimals(result.balance.amount, tokens[symbol].decimals));
  } catch (error) {
    console.log(
      `Got an error while trying to query ${symbol} token balance for address ${walletAddress}:`,
      result,
      error,
    );
    return unlockJsx;
  }
}

export const SwapPageWrapper = observer(() => {
  // SwapPageWrapper is necessary to get the user store from mobx 🤷‍♂️
  const { user } = useStores();

  return <SwapRouter user={user} />;
});

export class SwapRouter extends React.Component<
  Readonly<{ user: UserStoreEx }>
> {
  constructor(props: Readonly<{ user: UserStoreEx }>) {
    super(props);
    window.onhashchange = this.onHashChange.bind(this);
  }

  onHashChange() {
    this.forceUpdate();
  }

  render() {
    if (
      window.location.hash !== '#Swap' &&
      window.location.hash !== '#Provide' &&
      window.location.hash !== '#Withdraw'
    ) {
      window.location.hash = 'Swap';
      return <></>;
    }

    const containerStyle = {
      zIndex: '10',
      borderRadius: '30px',
      backgroundColor: 'white',
      padding: '2em',
      boxShadow:
        'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',
    };

    return (
      <BaseContainer>
        <PageContainer>
          <Box
            className={styles.faqContainer}
            pad={{ horizontal: 'large', top: 'large' }}
            style={{ alignItems: 'center' }}
          >
            <Box
              style={{
                maxWidth: '420px',
                minWidth: '420px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              pad={{ bottom: 'medium' }}
            >
              <SwapTab user={this.props.user} containerStyle={containerStyle} />
            </Box>
          </Box>
        </PageContainer>
      </BaseContainer>
    );
  }
}
