import React, { useState } from 'react';
import { Box } from 'grommet';
import { Title, Text } from 'components/Base';
import * as styles from './faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Icon } from 'components/Base/components/Icons';

const faqConfig = [
  {
    label: 'What is Horizon bridge?',
    text: () => (
      <p>
        Horizon is a cross-chain bridge that allows exchange of crypto assets
        (e.g., fungible/non-fungible tokens, stablecoins) between Ethereum and
        Harmony blockchains.
        <br />
        <br />
        Horizon UI is accessible at{' '}
        <a href="https://bridge.harmony.one/" target="_blank">
          https://bridge.harmony.one/
        </a>
      </p>
    ),
  },
  {
    label: 'What is Horizon used for?',
    text: () => (
      <p>
        Horizon’s main purpose is to enable transfer of assets from Ethereum to
        Harmony. Users holding assets on Ethereum can exchange them to
        corresponding assets on Harmony (1:1). Horizon also allows redemption of
        the exchanged assets back to the user's Ethereum account at any time.
      </p>
    ),
  },
  {
    label: 'How does Horizon work?',
    text: () => (
      <p>
        Horizon is comprised of two core components:
        <ul>
          <li>
            A set of smart contracts deployed on both Ethereum and Harmony
            blockchains
          </li>
          <li>
            A pool of validators that listens to events on both Ethereum and
            Harmony bridge smart contracts. When a token lock action is detected
            on Ethereum blockchain, the pool of validators validates it and
            relays the finalized information to the Harmony blockchain: here,
            the same amount of a bridged token is minted. On the opposite, when
            a bridged token burn is detected on Harmony blockchain, the pool of
            validators validates it and relays the finalized information to the
            Ethereum blockchain, where the same amount of the original token is
            unlocked.
          </li>
        </ul>
      </p>
    ),
  },
  {
    label: 'What kind of assets can be bridged using Horizon?',
    text: () => (
      <>
        <li>Stablecoins like BUSD, LINK, etc</li>
        <li>Any ERC20 tokens like USDT, USDC, WETH, WBTC, etc</li>
        <li>
          You can find information about the bridged assets at{' '}
          <a href="https://bridge.harmony.one/tokens" target="_blank">
            https://bridge.harmony.one/tokens
          </a>
        </li>
      </>
    ),
  },
  {
    label: 'How are assets mapped between Ethereum and Harmony?',
    text: () => (
      <p>
        Assets are mapped 1:1. For example, 10 “BUSD” on Ethereum after bridging
        will be available as 10 “1BUSD” in Harmony. Here, “1BUSD” is the token
        symbol of the token issued on Harmony corresponding to “BUSD” token
        symbol on Ethereum.
      </p>
    ),
  },
  {
    label:
      'What are the two types of tokens issued on Harmony when bridged using Horizon?',
    text: () => (
      <p>
        Horizon supports issuing of both permissioned and permissionless tokens.
        <ul>
          <li>
            BUSD and LINK are issued as permissioned tokens, where partners like
            Binance, ChainLink can work with Harmony to deploy their audited
            smart contracts such that bridge can issue full-feature smart
            contract tokens for the corresponding Ethereum tokens. This enables
            full utilization of the bridged tokens. For example, the bridged
            “1LINK” on Harmony can be directly used to pay the oracle providers
            through chainlink’s oracle smart contract, which would not have been
            possible if “1LINK” was HRC20.
          </li>
          <li>
            Any other ERC20 token is bridged in a permissionless manner, where
            the bridge will issue 1:1 HRC20 tokens. For example, a user after
            bridging their USDT will receive equivalent “1USDT” HRC20 tokens.
          </li>
        </ul>
      </p>
    ),
  },
  {
    label:
      'What is the difference between permissioned token (BUSD/LINK) vs permission-less token (ERC20)?',
    text: () => (
      <p>
        Permissioned tokens (BUSD, LINK) will have the full-features of the
        token’s smart contract, whereas permissionless tokens are issued as
        HRC20 with only ERC20-like features.
      </p>
    ),
  },
  {
    label: 'Does the token supply increase when using Horizon?',
    text: () => (
      <p>
        No: The supply of the original token never change as a result of using
        Horizon: Horizon bridge locks a certain amount of a token on Ethereum
        blockchain (essentially taking it out of circulation) and mints the
        exact same amount of tokens on the Harmony blockchain, that represents
        in all respects the original token (i.e. regenerating the locked
        supply). As a result, the circulating supply of the original token will
        stay the same: it's just split across two different blockchains instead
        of one.
      </p>
    ),
  },
  {
    label: 'What happens to my original tokens if I sell the bridged tokens?',
    text: () => (
      <p>
        Once you use Horizon to transfer your original tokens from Ethereum to
        Harmony, the original tokens get stored and locked in the Horizon
        contracts: you do not own those tokens on Ethereum anymore. On the other
        side, you now own the same amount of tokens that gets sent to you on the
        Harmony blockchain.
      </p>
    ),
  },

  {
    label: 'Can I send my bridged tokens back from Harmony to Ethereum?',
    text: () => (
      <p>
        Yes: you can send the bridged tokens from Harmony to Ethereum at any
        time, and receive back the same amount of the original token on
        Ethereum.
      </p>
    ),
  },

  {
    label: 'Can I bridge as many tokens as I want, or is there a limit?',
    text: () => (
      <p>
        There is no limit on the amount of tokens that can be bridged from
        Ethereum to Harmony.
      </p>
    ),
  },

  {
    label: 'Are bridged tokens transferable?',
    text: () => (
      <p>
        Yes. You can transfer the bridged tokens to other users and they can
        redeem them back to their Ethereum accounts. This is possible because
        when you lock your token, it gets pooled into a bridge smart contract
        from which any redeem request can be serviced without tying the locked
        tokens and redemption to a specific user account.
      </p>
    ),
  },

  {
    label: 'Can I send native ONE tokens to Ethereum using Horizon?',
    text: () => (
      <p>
        Yes, the Horizon bridge supports sending ONE tokens and HRC20 tokens
        issues on Harmony to Ethereum and back. Note that, the cost for any
        bridge transfers to Ethereum will be approximately equivalent to price
        of 400,000 Ethereum gas.
      </p>
    ),
  },

  {
    label: 'What tokens are supported by Horizon?',
    text: () => <p>BUSD, LINK, any ERC20</p>,
  },

  {
    label: 'What’s the cost of using the bridge?',
    text: () => (
      <>
        <p>
          <b>Sending ERC20/ETH to Harmony</b>
          <br />
          Involves two transactions (approve and lock) that requires
          approximately 100,000 Ethereum gas in total and the cost will be paid
          by the user. The multisig confirmation cost on the Harmony network is
          taken care by the validators.
        </p>
        <br />
        <p>
          <b>
            Sending HRC20/ONE to Ethereum or redeeming the bridged tokens back
            to Ethereum
          </b>{' '}
          <br />
          Any bridge transfers from Harmony to Ethereum involves multisig
          confirmations by the validators, which is approximately 400,000
          Ethereum gas. To cover this operating cost of the validators
          (especially during the volatility of Ethereum gas price), we require
          users to deposit an approximate network fee in ONE tokens, which is
          equivalent to 400,000 Ethereum gas.
        </p>
      </>
    ),
  },

  {
    label: 'Is Horizon bridge audited?',
    text: () => (
      <p>
        Yes, the Horizon bridge is fully audited and approved by{' '}
        <a href="https://blog.peckshield.com" target="_blank">
          Peckshield Inc.
        </a>
      </p>
    ),
  },

  {
    label: 'Is there a tutorial explaining how to use Horizon?',
    text: () => (
      <p>
        <a
          href="https://docs.harmony.one/home/showcases/crosschain/horizon-bridge"
          target="_blank"
        >
          https://docs.harmony.one/home/showcases/crosschain/horizon-bridge
        </a>
      </p>
    ),
  },

  {
    label: 'Is Horizon open source?',
    text: () => (
      <p>
        Yes: Horizon code is open source, you can find it on GitHub:
        <a href="https://github.com/harmony-one/ethhmy-bridge" target="_blank">
          https://github.com/harmony-one/ethhmy-bridge
        </a>
      </p>
    ),
  },
];

export const FAQPage = () => {
  const [expandedIdxs, setExpandedIdxs] = useState([]);

  const addExpanded = idx => setExpandedIdxs(expandedIdxs.concat([idx]));
  const removeExpanded = idx =>
    setExpandedIdxs(expandedIdxs.filter(item => item !== idx));

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          className={styles.faqContainer}
          pad={{ horizontal: 'large', top: 'large' }}
        >
          <Box direction="row" justify="center" margin={{ bottom: 'medium' }}>
            <Title
              style={{
                // color: '#47b8eb',
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
              size="large"
            >
              FAQ
            </Title>
          </Box>
          <Box style={{ background: 'white', borderRadius: 5 }} pad="xlarge">
            {faqConfig.map((item, idx) => {
              const isExpanded = expandedIdxs.includes(idx);

              return (
                <Box
                  className={styles.item}
                  direction="column"
                  key={String(idx)}
                  onClick={() =>
                    isExpanded ? removeExpanded(idx) : addExpanded(idx)
                  }
                >
                  <Box className={styles.label} direction="row" align="center">
                    <Box className={styles.labelIcon}>
                      {isExpanded ? '-' : '+'}
                    </Box>
                    {/*<Icon*/}
                    {/*  styles={{ marginBottom: 2 }}*/}
                    {/*  glyph={isExpanded ? 'Minus' : 'Plus'}*/}
                    {/*/>*/}
                    <Text size="large" style={{ marginLeft: 10 }} bold>
                      {item.label}
                    </Text>
                  </Box>
                  {isExpanded ? (
                    <Box className={styles.textContainer}>
                      <ul>
                        <li>
                          <Text size="medium" className={styles.text}>
                            {item.text()}
                          </Text>
                        </li>
                      </ul>
                    </Box>
                  ) : null}
                </Box>
              );
            })}
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
};
