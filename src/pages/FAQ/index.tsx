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
        (e.g., fungible/non-fungible tokens, stablecoins) between Ethereum,
        Binance Smart Chain and Harmony blockchains.
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
        Horizon’s main purpose is to enable transfer of assets from Ethereum (or
        Binance Smart Chain) to Harmony. Users holding assets on Ethereum (or
        Binance Smart Chain) can exchange them to corresponding assets on
        Harmony (1:1). Horizon also allows redemption of the exchanged assets
        back to the user's Ethereum (or Binance Smart Chain) account at any
        time.
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
            A set of smart contracts deployed on both Ethereum (and Binance
            Smart Chain) and Harmony blockchains
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
        <li>
          <b>From Ethereum:</b>
        </li>
        <ul>
          <li>Stablecoins like BUSD, LINK, etc</li>
          <li>Any ERC20 tokens like USDT, USDC, WETH, WBTC, etc</li>
          <li>
            You can find information about the bridged assets at{' '}
            <a href="https://bridge.harmony.one/tokens" target="_blank">
              https://bridge.harmony.one/tokens
            </a>
          </li>
        </ul>
        <br />
        <li>
          <b>From Binance Smart Chain:</b>
        </li>
        <ul>
          <li>
            Any BEP20 tokens like Binance-Peg Ethereum Token, Binance-Peg BUSD
            Token, Binance-Peg BUSD-T
          </li>
        </ul>
      </>
    ),
  },
  {
    label: 'How are assets mapped between Ethereum and Harmony?',
    text: () => (
      <Box direction="column" gap="15px">
        <p>
          Assets are mapped 1:1. For example, 10 “USDC” on Ethereum after
          bridging will be available as 10 “1USDC” on Harmony. Here, “1USDC” is
          the token symbol of the token on Harmony corresponding to
          “USDC” token symbol on Ethereum.
        </p>
        <p>
          Same 1:1 mapping holds true for Binance Smart Chain. However, the
          assets from two different parent chains (Ethereum or Binance Smart
          Chain), after bridging will be represented using different bridged
          assets on Harmony. For instance, 5 “Binance Smart Chain USDC“ after
          bridging will be available as 5 “bscUSDC“ on Harmony. Here, “bscUSDC”
          is the token symbol of the token issued on Harmony corresponding to
          “USDC” token symbol on Binance Smart Chain.
        </p>
        <p>
          And, the “1USDC“ and “bscUSDC“ on Harmony chain are not interchangeable, meaning one
          cannot bridge USDC from Ethereum to Harmony and then withdraw it on
          Binance Smart Chain. Same for other tokens.
        </p>
      </Box>
    ),
  },
  {
    label:
      'What are the two types of tokens issued on Harmony when bridged using Horizon?',
    text: () => (
      <p>
        Horizon supports issuing of both permissioned and permissionless tokens
        for Ethereum bridging.
        <ul>
          <li>
            BUSD and LINK are issued as permissioned tokens, where partners like
            Binance, ChainLink can work with Harmony to deploy their audited
            smart contracts such that bridge can issue full-feature smart
            contract tokens for the corresponding Ethereum tokens. This enables
            full utilization of the bridged tokens. For example, the bridged
            “LINK” on Harmony can be directly used to pay the oracle providers
            through chainlink’s oracle smart contract, which would not have been
            possible if “LINK” was HRC20.
          </li>
          <li>
            Any other ERC20 token is bridged in a permissionless manner, where
            the bridge will issue 1:1 HRC20 tokens. For example, a user after
            bridging their USDT will receive equivalent “1USDT” HRC20 tokens.
          </li>
          <li>
            For Binance Smart Chain, permissionless HRC20 tokens are issued for
            any BEP20 token.
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
        label: 'What account can I use to receive bridged tokens?',
        text: () => (
            <p>
                You need to be able to open your wallet in the network you sent your tokens to. Check that there are no network restrictions that prevents you from it. Also check if there is no limitations on a token type you can receive.
                Never send tokens to an exchange account.
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
        label: 'Can I send the Ethereum bridged tokens to Binance?',
        text: () => (
            <p>
                No, Ethereum bridged tokens can only be sent back to Ethereum. Same
                applies for Binance bridged tokens.
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
      <>
        <p>
          Yes, the Horizon bridge supports sending ONE tokens and HRC20 tokens
          issues on Harmony to Ethereum and back. Note that, the cost for any
          bridge transfers to Ethereum will be approximately equivalent to price
          of 400,000 Ethereum gas.
        </p>
      </>
    ),
  },

  {
    label: 'What tokens are supported by Horizon?',
    text: () => (
      <>
        <li>For Ethereum bridging: BUSD, LINK, any ERC20</li>
        <li>For Binance Smart Chain bridging: any BEP20</li>
      </>
    ),
  },

  {
    label: 'What’s the cost of using the bridge?',
    text: () => (
      <Box direction="column" gap="15px">
        <p>
          <b>Sending ERC20/ETH from Ethereum to Harmony</b>
          <br />
          Involves two transactions (approve and lock) that requires
          approximately 100,000 Ethereum gas in total and the cost will be paid
          by the user. The multisig confirmation cost on the Harmony network is
          taken care by the validators.
        </p>
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
        <p>
          Similarly for Binance Smart Chain, however the transaction fee are
          much lower (you get an accurate estimate of the bridge fee while using
          the bridge).
        </p>
      </Box>
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

  {
    label: 'Explanation of the bridge fee?',
    text: () => (
      <Box direction="column" gap="15px">
        <li>
          The Horizon bridge has still the lowest cost for Ethereum to Harmony
          transfers, however Harmony to Ethereum transfers will be expensive (at
          high Ethereum gas price). The Ethereum gas cost for our bridge is
          comparable to every other bridge that is currently on Ethereum
          mainnet. For example, SecretNetwork bridge, IoTex bridge, etc.
        </li>
        <li>
          We have been working tirelessly on the trustless and gas-efficient
          version of the bridge to Ethereum, which will be rolled out sometime
          soon. The cost of transferring assets from Harmony to Ethereum is
          expected to drastically improve. We will keep the community up to date
          on this release.
        </li>
      </Box>
    ),


  },

  // {
  //   label: 'Bridge issues and need help?',
  //   text: () => (
  //     <p>
  //       <b>
  //         Report any issues to bridge@harmony.one with one or more of the
  //         following informations:
  //       </b>
  //       <Box direction="column" gap="10px" margin={{ top: '10px' }}>
  //         <p>
  //           1) operation id, e.g., 7fa14f19-219f8220-1f209e61-8911e539 in{' '}
  //           <span>
  //             https://bridge.harmony.one/busd/operations/7fa14f19-219f8220-1f209e61-8911e539
  //           </span>
  //           . Every bridge operation is associated with a unique operation id,
  //           which is available in your webpage URL. If you didn't store the
  //           operation id, it is okay, follow 2) or 3)
  //         </p>
  //         <p>2) your transaction hashes on Ethereum or Harmony</p>
  //         <p>3) your ETH or ONE account address</p>
  //         <p>
  //           <span>
  //             Please allow 24-48 hours for your issue resolution. Happy
  //             Bridging!!!
  //           </span>
  //         </p>
  //       </Box>
  //     </p>
  //   ),
  // },

    {
        label: 'Bridge issues and need help?',
        text: () => (
            <p>
                See https://bridge.harmony.one/help
            </p>
        ),
    },

  {
    label:
      'What is the difference between ERC1155 or HRC1155 and ERC721 or HRC721?',
    text: () => (
      <Box direction="column" gap="15px">
        <li>
          ERC and HRC are the same token standard as Harmony is EVM compatible.
          The tokens launched by ERC721/ERC1155 are Non-Fungible Token. In
          ERC721, each token in the contract has a unique tokenid, and the
          amount is 1. ERC1155 is a collection of fungible token and
          non-fungible token distinguished by tokenid and the amount of tokens
          corresponding to each tokenid can be greater than 1. Compared to
          ERC721, ERC1155 adds more token operation methods and supports batch
          operations, added convenience and scalability.
        </li>
      </Box>
    ),
  },

  {
    label:
      'Why do I need to enter the tokenid when sending ERC1155 or HRC1155?',
    text: () => (
      <Box direction="column" gap="15px">
        <li>
          Since ERC1155 or HRC1155 uses tokenid to distinguish different tokens
          in the contract, you need to specify the tokenid of the transferred
          asset in the contract when transferring assets based on ERC1155 or
          HRC1155. In most cases, you can query your account through the block
          explorer to obtain the tokenid of the asset you need to send.
        </li>
      </Box>
    ),
  },

  {
    label:
      'How to fill in the quantity when sending NFT based on ERC1155 or HRC1155?',
    text: () => (
      <Box direction="column" gap="15px">
        <li>
          Since the tokens in the ERC1155 or HRC1155 contract can be fungible
          tokens or non-fungible token, we have added an additional field,
          “amount” to the input panel of ERC1155 or HRC1155 on GUI. If the asset
          you are transferring is a fungible token, you need to fill in the
          amount you expect to transfer. If the asset you are transferring is a
          non-fungible token, you can fill in 1.
        </li>
      </Box>
    ),
  },

  {
    label:
      'Why does a certification mark appear when I input part of ERC1155 or ERC721?',
    text: () => (
      <Box direction="column" gap="15px">
        <li>
          In order to prevent malicious fraud in crypto, when you transfer
          ERC1155 or ERC721 from Ethereum to Harmony, the bridge automatically
          checks the contract address you filled in with the verified items in
          the well-known NFT exchange OpenSea. If the contract address has been
          verified in OpenSea, the bridge will display the verified mark at the
          bottom of the address bar to ensure that you can quickly identify the
          authentication of the project.
        </li>
      </Box>
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
        <Box className={styles.faqContainer}>
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
          <Box
            style={{ background: 'white', borderRadius: 5 }}
            pad={{ vertical: 'large', horizontal: 'large' }}
          >
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
                    <Text
                      className={styles.labelText}
                      size="large"
                      style={{ marginLeft: 10 }}
                      bold
                    >
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
