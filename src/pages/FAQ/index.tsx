import React, { useState } from 'react';
import { Box } from 'grommet';
import { Title, Text } from 'components/Base';
import * as styles from './faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Icon } from 'components/Base/components/Icons';

const faqConfig = [
  {
    label: 'What is Secret - Ethereum bridge?',
    text: () => (
      <p>
        The bridge allows users to lock their ETH or ERC20 in a smart contract on Ethereum and mint secretETH or
        secretERC20, which are wrapped tokens with privacy on the Secret Network based on{' '}
        <a href="https://github.com/SecretFoundation/SNIPs/blob/master/SNIP-20.md" target="_blank" rel="noreferrer">
          SNIP-20 standard
        </a>
        .
      </p>
    ),
  },
  {
    label: 'Something happened! Are my funds gone?',
    text: () => (
      <>
        <p>
          Relax. No matter what happens your Ethereum assets are safely stored in our multisig contract. As long as you've entered a Secret Network address that you control, your funds are safe.
        </p>
        <br />
        <p>
          That being said, our legal team requires us to say that none of the bridge operators takes any responsibility
          for any direct or indirect damages that may be caused by using this software. Choosing to interact with the
          Bridge is solely up to the discretion of the user.
        </p>
      </>
    ),
  },
  {
    label: 'How do I use Secret - Ethereum bridge?',
    text: () => (
      <>
        <p>
          In order to interact with Ethereum and Secret Network, users will have to use{' '}
          <a href="https://metamask.io/" target="_blank" rel="noreferrer">
            Metamask
          </a>{' '}
          and{' '}
          <a href="https://wallet.keplr.app/" target="_blank" rel="noreferrer">
            Keplr
          </a>{' '}
          wallets. Once the user connects the wallets to the application, she can use the bridge:
        </p>
        <br />
        <p>
          <i>Ethereum -{'>'} Secret Network</i>
        </p>
        <p>
          This will require Alice to select the Ethereum asset that she wants to use with privacy on the Secret Network
          and a Secret Network destination address. Alice will then sign TXs on Metamask to move tokens to a locking
          smart contract on Ethereum. Once assets are sent to the deposit contract on Ethereum, the bridge multisig
          operators will mint secretETH/secretERC20 to the address Alice provided above. There's a 3 blocks confirmation
          period on Ethereum, before secret tokens are minted on Secret Network.
        </p>
        <br />
        <p>
          <i>Secret Network -{'>'} Ethereum</i>
        </p>
        <p>
          This will require Alice to burn secretETH/secretERC20 and provide an ETH destination address. Once the SNIP-20
          tokens are burned on Secret Network, the multisig committee will unlock funds from the deposit contract and
          send to the address Alice provided.
        </p>
        <br />
        <p>
          <i>Unlocking secretToken balances and viewing keys</i>
        </p>
        <p>
          When a user connects her Keplr to the application, she’ll be given the ability to unlock secretToken balances.
          Since secretTokens are encrypted in nature, a user must create a viewing key in order to see her balances. A
          viewing key will be created by signing a transaction on Secret Network. A User should safely store her viewing
          keys to avoid doing a transaction on Secret Network each time she wants to see her secretToken balance.
        </p>
      </>
    ),
  },
  {
    label: 'What’s the cost of using the bridge?',
    text: () => (
      <>
        <p>
          For a full journey (ETH -{'>'} SCRT -{'>'} ETH), users need a total of approximately 500K gas on Ethereum.
          This is approximately ⅓ of the cost of using Tornado Cash.
        </p>

        <br />
        <i>Sending ETH/ERC20 to Secret Network</i>
        <p>
          Alice spends {'<'}100K gas on Ethereum (ERC20s will need a one-time spending approval TX). Gas on Secret
          Network is covered by the multisig committee.
        </p>

        <br />
        <i>Sending SecretTokens to Ethereum</i>
        <ul>
          <li>To burn her tokens, Alice pays gas fee on Secret Network which is denominated in SCRT</li>
          <li>
            SCRT Users pay a fee that’s deducted from assets on Ethereum. This fee is designed to cover the operating
            cost (the gas cost of the multisig TX to unlock the Ethereum assets) of the multisig and account for the
            volatility in gas prices. This fee is denominated in the base currency and is approximately equivalent to
            the price of 500,000 Ethereum gas, in the denomination of token you are withdrawing
          </li>
        </ul>
      </>
    ),
  },
  {
    label: 'How does the multisig bridge work?',
    text: () => (
      <>
        <i>Ethereum multisig lock / release smart contract</i>
        <p>
          The unlocking of Ethereum assets sent to the deposit contract is managed by a <i>3 of 5</i> multisig
          transaction on Ethereum. The contract receives ETH and ERC20 assets by holder of these tokens. The smart
          contract only releases these assets when the threshold number of (3) signatures are collected on the Ethereum
          blockchain from the bridge operators.
        </p>
        <br />

        <i>Secret Network</i>
        <p>
          Minting on Secret Network requires the multisig committee to collect valid off-chain signatures and broadcast
          signed transactions to the Secret Network. The difference is due to how multisig is implemented on Ethereum
          and Secret Network, however they are both of equal level of security. Each pair of assets (e.g. ETH{'<'}-{'>'}
          secretETH) is managed by two secret contracts: The first is the swap contract to mint and burn tokens and the
          second is the SNIP-20 contract, which manages the token.
        </p>
        <br />
        <p>
          For more information on SNIP-20 please refer to the standard{' '}
          <a href="https://github.com/SecretFoundation/SNIPs/blob/master/SNIP-20.md" target="_blank" rel="noreferrer">
            documentation
          </a>
          . You can see the bridge code{' '}
          <a href="https://github.com/enigmampc/EthereumBridge" target="_blank" rel="noreferrer">
            here
          </a>
          .
        </p>
      </>
    ),
  },
  {
    label: 'Who are the bridge operators?',
    text: () => (
      <p>
        The bridge operators are very reputable staking operators:{' '}
        <a href="https://figment.io/" target="_blank" rel="noreferrer">
          Figment
        </a>
        ,{' '}
        <a href="https://staked.us/" target="_blank" rel="noreferrer">
          Staked
        </a>
        ,{' '}
        <a href="https://bharvest.io/" target="_blank" rel="noreferrer">
          B-Harvest
        </a>
        ,{' '}
        <a href="https://citadel.one/" target="_blank" rel="noreferrer">
          Citadel.one
        </a>{' '}
        and{' '}
        <a href="https://enigma.co/" target="_blank" rel="noreferrer">
          Enigma
        </a>
        .
      </p>
    ),
  },
  {
    label: 'Which tokens are supported?',
    text: () => (
      <p>
        Currently the bridge supports ETH, OCEAN, YFI, UNI, TUSD, SNX, MKR, DAI, BAND, LINK, AAVE, COMP, KNC, USDT, WBTC
        and BAC. If you’d like to see support for other tokens, please fill{' '}
        <a href="https://airtable.com/shrLzEMvRiRFS4LpZ" target="_blank" rel="noreferrer">
          this form
        </a>
        .
      </p>
    ),
  },
  {
    label: 'What are the risks involved with Secret - Ethereum bridge?',
    text: () => (
      <>
        <i>Smart Contract risk</i>
        <p>
          The multisig contract on Ethereum is based an updated version of Gnosis MultiSigWallet, which is one of the
          most well known, trusted multisig contracts on Ethereum. The code itself is very simple, which means that the
          attack surface of the contract is minimal and provides a high degree of trust that locked funds are secure.
        </p>
        <br />
        <i>Multisig-bridge risk</i>
        <p>
          If the majority of the bridge operators, which are regulated and well-respected entities in the space, decide
          to collude, users are at risk of losing their funds. Similarly if the operators, which are professional
          validator service providers, go offline, then the users will not be able to move their funds before 3 of the 5
          operators are online again. We have specifically chosen professional entities to minimize such risk, and
          requiring only 3-out-of-5 means that even occasional outages will not compromise service availability
        </p>
        <br />
        <i>Other risks</i>
        <ul>
          <li>
            <i>Ethereum Network congestion:</i> The volatility of gas prices on Ethereum means that your cost of privacy
            will fluctuate based on network congestion. In addition, this may affect the time it takes to approve
            transactions and swaps.
          </li>
        </ul>
      </>
    ),
  },
  {
    label: 'Why do I have to unlock Secret Tokens? What is a Viewing Key?',
    text: () => (
      <>
        <p>
          Tokens on the Secret Network, based on the SNIP-20 standard, are privacy tokens. All transactions and balances
          are completely private. As such, even your wallet software cannot know your balance without being given
          express permission. This is what "unlocking" a token means.
        </p>
        <br />
        <p>
          The method by which you give your wallet, or a site viewing permissions is called Viewing Keys. The Viewing
          Key is a string that is stored by the SNIP-20 contract, and is used to grant access to read-only queries.
          Keplr wallet has built-in support for these Viewing Keys, and you can create them using the native interface.
          In addition, it is important to know that each token requires a separate Viewing Key.
        </p>
      </>
    ),
  },
  {
    label: 'How can I get help?',
    text: () => (
      <>
        <p>
          Report any issues in the <strong>#🌉bridge-support</strong> channel on the{' '}
          <a href="http://chat.scrt.network/" target="_blank" rel="noreferrer">
            Secret Network Discord server
          </a>{' '}
          with one or more of the following information:
        </p>
        <br />
        <p>
          1) Transaction id, e.g., 7fa14f19-219f8220-1f209e61-8911e539 in . Every bridge operation is associated with a
          unique transaction id, which is available in your webpage URL. If you didn't store the transaction id, it is
          okay, follow 2) or 3).
        </p>
        <p>
          2) Transaction hashes on Ethereum or Secret Network, you can find this information under Transactions tab.
        </p>
        <p>3) ETH or Secret account address you used for the bridge.</p>
        <br />
        <p>Please allow 24-48 hours for your issue resolution. Happy Bridging!!!</p>
      </>
    ),
  },
  {
    label: 'Did you guys build this amazing UI yourselves?',
    text: () => (
      <>
        <p>
          This site is based on{' '}
          <a
            href="https://docs.harmony.one/home/general/showcases/crosschain/horizon-bridge"
            target="_blank"
            rel="noreferrer"
          >
            Horizon Bridge by Harmony ONE
          </a>
          . We want to thank them for allowing us to fork their repository, and build off their work.
        </p>
      </>
    ),
  },
];

export const FAQPage = () => {
  const [expandedIdxs, setExpandedIdxs] = useState([]);

  const addExpanded = idx => setExpandedIdxs(expandedIdxs.concat([idx]));
  const removeExpanded = idx => setExpandedIdxs(expandedIdxs.filter(item => item !== idx));

  return (
    <BaseContainer>
      <PageContainer>
        <Box className={styles.faqContainer} pad={{ horizontal: 'large', top: 'large' }}>
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
                <Box className={styles.item} direction="column" key={String(idx)}>
                  <Box
                    className={styles.label}
                    direction="row"
                    align="center"
                    onClick={() => (isExpanded ? removeExpanded(idx) : addExpanded(idx))}
                  >
                    <Box className={styles.labelIcon}>{isExpanded ? '-' : '+'}</Box>
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
                      <Text size="medium" className={styles.text} style={{ padding: '20 20 0 20', cursor: 'auto' }}>
                        {item.text()}
                      </Text>
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
