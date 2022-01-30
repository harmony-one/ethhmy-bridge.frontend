import React, { useState } from 'react';
import { Box } from 'grommet';
import { Title, Text } from 'components/Base';
import * as styles from './faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Icon } from 'components/Base/components/Icons';

const faqConfig = [
    {
        label: 'Transaction is pending for too long',
        text: () => (
            <p>
                If your transaction is pending for too long, you can manage it via your wallet. We can’t make it faster or cancel it.
                If transaction is on Harmony side, make sure you use
                <a href="https://docs.harmony.one/home/network/wallets/browser-extensions-wallets/metamask-wallet">
                    recommended settings
                </a>
                for Harmony network.
            </p>
        ),
    },

    {
        label: 'Operation has been in progress for too long',
        text: () => (
            <p>
                Normally it takes less than 20 minutes per step to complete a transaction. Delays are also possible but they won’t affect your funds.
                <br>
                    If your operation is in progress on the final step for more than an hour, please report to a #bridge channel in the Discord community. Please don’t send a request to support in this case, it’ll be ignored unless you send an update that your operation ended up with an error.
                    If there are many operations in progress, it’s usually because of global RPC issues. In this case, the support team can’t make it faster for you.
                </br>
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
    label: 'I bridged my tokens but only received 0.01 ONE in my account',
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
        label: 'Got a bridge error in the end',
        text: () => (
            <p>
                You have an error in the end if the last (mint/unlock) transaction status is error, and all the transactions before was successful.
                <br>
                    Email <span>bridge@harmony.one</span> your wallet address and any transaction hash related to the failed transfer or operaion ID. We need all the data in text format.
                    In subject always mention token amount, token type type and transfer direction (ETH->HMY/HMY->BSC, etc). Describe your problem.
                    Please allow 24-48 hours to resolve.
                    Do not email, if you have a bridge question or doubt,
                    you won't get a reply. For question/doubt, look at <b>FAQ</b> section or
                    ask in the bridge channels (discord, telegram).
                </br>
            </p>
        ),
    },

  {
    label: 'Deposited ONE was’t withdrawn for failed HMY→BSC / HMY→ETH operation',
    text: () => (
      <p>
          The deposits of all failed transactions are returned after the 1-hour timeout.
          If you do not receive the deposit back even after the timeout, then email <span>bridge@harmony.one</span>.
          If you send email earlier, it will be ignored.
          Include in your email deposit transaction hash/URL, operation ID and wallet address. If you don't have an operation ID, mention operation day and time with a timezone.
          In subject always mention token amount, token type type and transfer direction (BSC->HMY/HMY->BSC). Describe your problem.
          We need all the data in text format. Please allow 24-48 hours to resolve.
      </p>
    ),
  },

    {
        label: 'Incomplete operation. Funds are locked/burnt on the first chain and not unlocked/minted on the other',
        text: () => (
            <p>
                This is the case when your bridged amount was locked/burnt on the first chain, but your operation failed on this step. If you was experiencing connection issues during the operation, it’s probably your case.

                <ul>This is your case if all this conditions are met in the same time:
                <li> You have lock/burn Harmony bridge transaction in your first chain explorer on the same amount and time as the operation.</li>
                <li> However, there is no successful bridge operation with this transaction. </li>
                <li> The lock/burn step status of your operation is “canceled” (if transaction was rejected by timeout) or “error”.</li>
                </ul>

                Email <span>bridge@harmony.one</span> your wallet address, lock/burn transaction hash/URL, operation ID. If you don't have operation ID, include any transaction hash associated with the operation or mention operation day and time with a timezone.
                In subject always mention token amount, token type type and transfer direction (ETH->HMY/HMY->BSC, etc). Describe your problem.
                We need all the data in text format. Please allow 24-48 hours to resolve.
            </p>
        ),
    },

    {
        label: 'How to find operation details',
        text: () => (
            <p>
                If you perform your operation on bridge.harmony.one, you can find the details on your operation page (e.g: https://bridge.harmony.one/hrc20/operations/7fa514f29-219f9210-1f209e61-8911e539)
                Every bridge operation is associated with a unique operation ID (e.g. 7fa514f29-219f9210-1f209e61-8911e539)
                which is available in your operation page URL.
                On the page, you can find links to transactions of the operation steps and the status of each step.
                <br>
                You can also find your operation in the
                <a href="https://bridge.harmony.one/explorer">
                    bridge operations explorer
                </a>.
                You can check the “Only my transactions” checkbox to see your operations. The wallet you used for your operation must be connected to make it work.

                You can see wallets used, operation status, token type, amount, and time of operation.

                You can rely on the date and time, amount, and token type of the operation to find it. If you have a transaction hash you can also check by it (if it’s from the Harmony explorer, there are two hash options: Hash/ Ethereum hash).
                </br>
            </p>
        ),
    },

    {
        label: 'By mistake sent tokens to exchange wallet (e.g. Binance)',
        text: () => (
            <p>
                Unfortunately your tokens are permanently lost and not recoverable.
            </p>
        ),
    },

    {
        label: 'I sent tokens to a wallet that doesn’t support the network I used',
        text: () => (
            <p>
                If you can’t open your wallet in the network where your tokens was sent, we can’t assist. You can try to reach a support of the service that gave you this account.
            </p>
        ),
    },

    {
        label: 'By mistake sent tokens to a token address',
        text: () => (
            <p>
                Unfortunately your tokens are permanently lost and not recoverable.
            </p>
        ),
    },

  // {
  //   label: 'Can I send the Ethereum bridged tokens to Binance?',
  //   text: () => (
  //     <p>
  //       No, Ethereum bridged tokens can only be sent back to Ethereum. Same
  //       applies for Binance bridged tokens.
  //     </p>
  //   ),
  // },
    //->faq

  {
    label: 'ERC20 or BEP20 or HRC20, which one to select?',
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
        be deployed on Ethereum which is a one time cost and really expensive.
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

  {
    label: 'I can’t bridge because of an error',
    text: () => (
      <p>
        There can be many possible causes. Sometimes the reason is clear from the error message (for example, low balance).

          <ul>
              Often there is a problem with the wallet connection. Try these steps to solve it:
          <li> Please make sure your browser and the wallet extension are updated to the latest version </li>
          <li> Make sure that your browser doesn’t block pop-up windows.</li>
          <li> Try to clear the cache and relogin.</li>
          <li> Check <a href="https://docs.harmony.one/home/network/wallets/browser-extensions-wallets/metamask-wallet">here</a> if your metamask is set up correctly.</li>
          <li> Try using another browser or/and wallet extension.</li>
          <li> If you use a mobile version, try it on the desktop.</li>
          </ul>
          If you’ve checked your settings but you still have errors, please share your problem in the #support or #bridge Discord channel.
      </p>
    ),
  },
];

export const HelpPage = () => {
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
              Need Help
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
