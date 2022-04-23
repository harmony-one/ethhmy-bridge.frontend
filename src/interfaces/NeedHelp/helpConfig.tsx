import React, { useState } from 'react';
import { Box } from 'grommet';
import { Title, Text } from 'components/Base';
import * as styles from './faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Icon } from 'components/Base/components/Icons';

export const faqConfig = [
  // {
  //   label: 'What is Horizon bridge?',
  //   text: () => (
  //     <p>
  //       Horizon is a cross-chain bridge that allows exchange of crypto assets
  //       (e.g., fungible/non-fungible tokens, stablecoins) between Ethereum,
  //       Binance Smart Chain and Harmony blockchains.
  //       <br />
  //       <br />
  //       Horizon UI is accessible at{' '}
  //       <a href="https://bridge.harmony.one/" target="_blank">
  //         https://bridge.harmony.one/
  //       </a>
  //     </p>
  //   ),
  // },
  // {
  //   label: 'What is Horizon used for?',
  //   text: () => (
  //     <p>
  //       Horizon’s main purpose is to enable transfer of assets from Ethereum (or
  //       Binance Smart Chain) to Harmony. Users holding assets on Ethereum (or
  //       Binance Smart Chain) can exchange them to corresponding assets on
  //       Harmony (1:1). Horizon also allows redemption of the exchanged assets
  //       back to the user's Ethereum (or Binance Smart Chain) account at any
  //       time.
  //     </p>
  //   ),
  // },
  // {
  //   label: 'How does Horizon work?',
  //   text: () => (
  //     <p>
  //       Horizon is comprised of two core components:
  //       <ul>
  //         <li>
  //           A set of smart contracts deployed on both Ethereum (and Binance
  //           Smart Chain) and Harmony blockchains
  //         </li>
  //         <li>
  //           A pool of validators that listens to events on both Ethereum and
  //           Harmony bridge smart contracts. When a token lock action is detected
  //           on Ethereum blockchain, the pool of validators validates it and
  //           relays the finalized information to the Harmony blockchain: here,
  //           the same amount of a bridged token is minted. On the opposite, when
  //           a bridged token burn is detected on Harmony blockchain, the pool of
  //           validators validates it and relays the finalized information to the
  //           Ethereum blockchain, where the same amount of the original token is
  //           unlocked.
  //         </li>
  //       </ul>
  //     </p>
  //   ),
  // },
  // {
  //   label: 'What kind of assets can be bridged using Horizon?',
  //   text: () => (
  //     <>
  //       <li>
  //         <b>From Ethereum:</b>
  //       </li>
  //       <ul>
  //         <li>Stablecoins like BUSD, LINK, etc</li>
  //         <li>Any ERC20 tokens like USDT, USDC, WETH, WBTC, etc</li>
  //         <li>
  //           You can find information about the bridged assets at{' '}
  //           <a href="https://bridge.harmony.one/tokens" target="_blank">
  //             https://bridge.harmony.one/tokens
  //           </a>
  //         </li>
  //       </ul>
  //       <br />
  //       <li>
  //         <b>From Binance Smart Chain:</b>
  //       </li>
  //       <ul>
  //         <li>
  //           Any BEP20 tokens like Binance-Peg Ethereum Token, Binance-Peg BUSD
  //           Token, Binance-Peg BUSD-T
  //         </li>
  //       </ul>
  //     </>
  //   ),
  // },
  // {
  //   label: 'How are assets mapped between Ethereum and Harmony?',
  //   text: () => (
  //     <Box direction="column" gap="15px">
  //       <p>
  //         Assets are mapped 1:1. For example, 10 “BUSD” on Ethereum after
  //         bridging will be available as 10 “1BUSD” on Harmony. Here, “1BUSD” is
  //         the token symbol of the token issued on Harmony corresponding to
  //         “BUSD” token symbol on Ethereum.
  //       </p>
  //       <p>
  //         Same 1:1 mapping holds true for Binance Smart Chain. However, the
  //         assets from two different parent chains (Ethereum or Binance Smart
  //         Chain), after bridging will be represented using different bridged
  //         assets on Harmony. For instance, 5 “Binance Smart Chain BUSD“ after
  //         bridging will be available as 5 “bscBUSD“ on Harmony. Here, “bscBUSD”
  //         is the token symbol of the token issued on Harmony corresponding to
  //         “BUSD” token symbol on Binance Smart Chain.
  //       </p>
  //       <p>
  //         And, the “1BUSD“ and “bscBUSD“ are not interchangeable, meaning one
  //         cannot bridge BUSD from Ethereum to Harmony and then withdraw it on
  //         Binance Smart Chain.
  //       </p>
  //     </Box>
  //   ),
  // },
  // {
  //   label:
  //     'What are the two types of tokens issued on Harmony when bridged using Horizon?',
  //   text: () => (
  //     <p>
  //       Horizon supports issuing of both permissioned and permissionless tokens
  //       for Ethereum bridging.
  //       <ul>
  //         <li>
  //           BUSD and LINK are issued as permissioned tokens, where partners like
  //           Binance, ChainLink can work with Harmony to deploy their audited
  //           smart contracts such that bridge can issue full-feature smart
  //           contract tokens for the corresponding Ethereum tokens. This enables
  //           full utilization of the bridged tokens. For example, the bridged
  //           “1LINK” on Harmony can be directly used to pay the oracle providers
  //           through chainlink’s oracle smart contract, which would not have been
  //           possible if “1LINK” was HRC20.
  //         </li>
  //         <li>
  //           Any other ERC20 token is bridged in a permissionless manner, where
  //           the bridge will issue 1:1 HRC20 tokens. For example, a user after
  //           bridging their USDT will receive equivalent “1USDT” HRC20 tokens.
  //         </li>
  //         <li>
  //           For Binance Smart Chain, permissionless HRC20 tokens are issued for
  //           any BEP20 token.
  //         </li>
  //       </ul>
  //     </p>
  //   ),
  // },
  // {
  //   label:
  //     'What is the difference between permissioned token (BUSD/LINK) vs permission-less token (ERC20)?',
  //   text: () => (
  //     <p>
  //       Permissioned tokens (BUSD, LINK) will have the full-features of the
  //       token’s smart contract, whereas permissionless tokens are issued as
  //       HRC20 with only ERC20-like features.
  //     </p>
  //   ),
  // },
  // {
  //   label: 'Does the token supply increase when using Horizon?',
  //   text: () => (
  //     <p>
  //       No: The supply of the original token never change as a result of using
  //       Horizon: Horizon bridge locks a certain amount of a token on Ethereum
  //       blockchain (essentially taking it out of circulation) and mints the
  //       exact same amount of tokens on the Harmony blockchain, that represents
  //       in all respects the original token (i.e. regenerating the locked
  //       supply). As a result, the circulating supply of the original token will
  //       stay the same: it's just split across two different blockchains instead
  //       of one.
  //     </p>
  //   ),
  // },
  // {
  //   label: 'What happens to my original tokens if I sell the bridged tokens?',
  //   text: () => (
  //     <p>
  //       Once you use Horizon to transfer your original tokens from Ethereum to
  //       Harmony, the original tokens get stored and locked in the Horizon
  //       contracts: you do not own those tokens on Ethereum anymore. On the other
  //       side, you now own the same amount of tokens that gets sent to you on the
  //       Harmony blockchain.
  //     </p>
  //   ),
  // },
  // {
  //   label: 'Can I send my bridged tokens back from Harmony to Ethereum?',
  //   text: () => (
  //     <p>
  //       Yes: you can send the bridged tokens from Harmony to Ethereum at any
  //       time, and receive back the same amount of the original token on
  //       Ethereum.
  //     </p>
  //   ),
  // },
  // {
  //   label: 'Can I bridge as many tokens as I want, or is there a limit?',
  //   text: () => (
  //     <p>
  //       There is no limit on the amount of tokens that can be bridged from
  //       Ethereum to Harmony.
  //     </p>
  //   ),
  // },
  // {
  //   label: 'Are bridged tokens transferable?',
  //   text: () => (
  //     <p>
  //       Yes. You can transfer the bridged tokens to other users and they can
  //       redeem them back to their Ethereum accounts. This is possible because
  //       when you lock your token, it gets pooled into a bridge smart contract
  //       from which any redeem request can be serviced without tying the locked
  //       tokens and redemption to a specific user account.
  //     </p>
  //   ),
  // },
  // {
  //   label: 'Can I send native ONE tokens to Ethereum using Horizon?',
  //   text: () => (
  //     <>
  //       <p>
  //         Yes, the Horizon bridge supports sending ONE tokens and HRC20 tokens
  //         issues on Harmony to Ethereum and back. Note that, the cost for any
  //         bridge transfers to Ethereum will be approximately equivalent to price
  //         of 400,000 Ethereum gas.
  //       </p>
  //       <p>
  //         The Horizon bridge does not supports sending ONE tokens and HRC20
  //         tokens to Binance Smart Chain yet, but this feature will be available
  //         very soon.
  //       </p>
  //     </>
  //   ),
  // },
  // {
  //   label: 'What tokens are supported by Horizon?',
  //   text: () => (
  //     <>
  //       <li>For Ethereum bridging: BUSD, LINK, any ERC20</li>
  //       <li>For Binance Smart Chain bridging: any BEP20</li>
  //     </>
  //   ),
  // },
  // {
  //   label: 'What’s the cost of using the bridge?',
  //   text: () => (
  //     <Box direction="column" gap="15px">
  //       <p>
  //         <b>Sending ERC20/ETH from Ethereum to Harmony</b>
  //         <br />
  //         Involves two transactions (approve and lock) that requires
  //         approximately 100,000 Ethereum gas in total and the cost will be paid
  //         by the user. The multisig confirmation cost on the Harmony network is
  //         taken care by the validators.
  //       </p>
  //       <p>
  //         <b>
  //           Sending HRC20/ONE to Ethereum or redeeming the bridged tokens back
  //           to Ethereum
  //         </b>{' '}
  //         <br />
  //         Any bridge transfers from Harmony to Ethereum involves multisig
  //         confirmations by the validators, which is approximately 400,000
  //         Ethereum gas. To cover this operating cost of the validators
  //         (especially during the volatility of Ethereum gas price), we require
  //         users to deposit an approximate network fee in ONE tokens, which is
  //         equivalent to 400,000 Ethereum gas.
  //       </p>
  //       <p>
  //         Similarly for Binance Smart Chain, however the transaction fee are
  //         much lower (you get an accurate estimate of the bridge fee while using
  //         the bridge).
  //       </p>
  //     </Box>
  //   ),
  // },
  // {
  //   label: 'Is Horizon bridge audited?',
  //   text: () => (
  //     <p>
  //       Yes, the Horizon bridge is fully audited and approved by{' '}
  //       <a href="https://blog.peckshield.com" target="_blank">
  //         Peckshield Inc.
  //       </a>
  //     </p>
  //   ),
  // },
  // {
  //   label: 'Is there a tutorial explaining how to use Horizon?',
  //   text: () => (
  //     <p>
  //       <a
  //         href="https://docs.harmony.one/home/showcases/crosschain/horizon-bridge"
  //         target="_blank"
  //       >
  //         https://docs.harmony.one/home/showcases/crosschain/horizon-bridge
  //       </a>
  //     </p>
  //   ),
  // },
  // {
  //   label: 'Is Horizon open source?',
  //   text: () => (
  //     <p>
  //       Yes: Horizon code is open source, you can find it on GitHub:
  //       <a href="https://github.com/harmony-one/ethhmy-bridge" target="_blank">
  //         https://github.com/harmony-one/ethhmy-bridge
  //       </a>
  //     </p>
  //   ),
  // },
  // {
  //   label: 'Explaination of the bridge fee?',
  //   text: () => (
  //     <Box direction="column" gap="15px">
  //       <li>
  //         The Horizon bridge has still the lowest cost for Ethereum to Harmony
  //         transfers, however Harmony to Ethereum transfers will be expensive (at
  //         high Ethereum gas price). The Ethereum gas cost for our bridge is
  //         comparable to every other bridge that is currently on Ethereum
  //         mainnet. For example, SecretNetwork bridge, IoTex bridge, etc.
  //       </li>
  //       <li>
  //         We have been working tirelessly on the trustless and gas-efficient
  //         version of the bridge to Ethereum, which will be rolled out sometime
  //         soon. The cost of transferring assets from Harmony to Ethereum is
  //         expected to drastically improve. We will keep the community up to date
  //         on this release.
  //       </li>
  //     </Box>
  //   ),
  // },
  {
    label: 'Got a bridge error in the end',
    text: () => (
      <p>
        Email <span>bridge@harmony.one</span> your wallet address or any
        transaction hash related to the failed transfer. Please allow 24-48
        hours to resolve. Do not email, if you have a bridge question or doubt,
        you won't get a reply. For question/doubt, look at <b>FAQ</b> section or
        ask in the bridge channels (discord, telegram).
      </p>
    ),
  },
  {
    label: 'Bridge success, but tokens not in wallet',
    text: () => (
      <p>
        Keep calm, your tokens are in your account, but not displayed in your
        wallet. Find the bridged token address and add it to your wallet to see
        the correct balance as shown here{' '}
        <a
          href="https://docs.harmony.one/home/general/horizon-bridge/adding-tokens"
          target="_blank"
          rel="noreferrer"
        >
          Adding tokens doc
        </a>
      </p>
    ),
  },
  {
    label: 'I bridged my tokens by only received 0.01 ONE in my account',
    text: () => (
      <p>
        Bridge does not swap tokens, it only provides wrapped tokens. For the
        token that you bridged, you have received wrapped token to your account.
        If you cannot find it, find the wrapped token address and add to your
        wallet as shown{' '}
        <a
          href="https://docs.harmony.one/home/general/horizon-bridge/adding-tokens"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>{' '}
        <span>0.01 ONE</span> is provided to every new wallet that bridged for
        the first time to help with transaction fee on the Harmony network.
      </p>
    ),
  },
  {
    label: 'By mistake sent tokens to exchance wallet (e.g. Binance)',
    text: () => (
      <p>
        Unfortunately your tokens are permanently lost and is not recoverable.
      </p>
    ),
  },

  {
    label: 'My bridge transaction failed and I lost my deposit',
    text: () => (
      <p>
        The deposits of all failed transactions are returned back after the 1
        hour timeout. If you do not receive the deposit back even after the
        timeout, then email <span>bridge@harmony.one</span>.
      </p>
    ),
  },
  {
    label: 'Can I send the Ethereum bridged tokens to BSC?',
    text: () => (
      <p>
        No, ethereum bridged tokens can only be sent back to ethereum. Same
        applies for BSC bridged tokens.
      </p>
    ),
  },

  {
    label: 'ERC20 or BEP20 or HRC20 , which one to select?',
    text: () => (
      <p>
        The token type you select is based on where the token was originally
        issued. For example, if you are bridging USDT from ethereum or sending
        it back, always use ERC20. Use BEP20 option for any BEP20 token that you
        are bridging from BSC or sending it back. Use HRC20 option only for
        tokens that were originally minted on Harmony. For example, VIPER. Never
        use HRC20 option for sending back the Ethereum or BSC bridged tokens.
      </p>
    ),
  },

  {
    label: 'ERC721 or HRC721, which one to use?',
    text: () => (
      <p>
        If your NFT was minted on Ethereum use the ERC721 option for both
        sending to Harmony and sending it back. If your NFT was originally
        minted on Harmony, use the HRC721 option. Same rule applies for ERC1155
        and HRC1155.
      </p>
    ),
  },

  {
    label: 'Why Harmony to Ethereum transfers are so expensive?',
    text: () => (
      <p>
        Horizon bridge uses on-chain multisig technique to confirm crosschain
        transactions, which costs at least 400,000 ethereum gas, which is
        approximately $300 for ethereum gas price of 200 gwei and $4000 ETH
        price.
      </p>
    ),
  },

  {
    label: 'Why sending my Harmony minted NFT to Ethereum is so expensive?',
    text: () => (
      <p>
        When you bridge your Harmony minted NFT to Ethereum, a new contract must
        be deployed on Etheruem which is a one time cost and really expensive.
        It is advisable that your Harmony NFT project bare this cost. After the
        contract is deployed, the subsequent bridging costs are for multisig
        based minting of the NFT on ethereum. This incurs 600,000 gas and may
        cost few hundred dollars.
      </p>
    ),
  },

  {
    label:
      'I am getting an error saying not enough eth for paying gas, what does it mean?',
    text: () => (
      <p>
        This means you don't have enough ONE tokens for paying Ethereum gas when
        doing Harmony to Ethereum transfer. Note that, bridge validators pay the
        ethereum gas fee and you pay the bridge validators using ONE tokens.
      </p>
    ),
  },
];
