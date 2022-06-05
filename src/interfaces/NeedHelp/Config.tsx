import React, { useState } from 'react';

export const faqConfig = [
  {
    label: "How to find out what's with my bridge operation?",
    text: () => (
      <p>
        If you perform your operation on bridge.harmony.one, you can find the
        operation details on your operation page. Also, you can always find your
        operation in the bridge operation explorer. Please refer to{' '}
        <a href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/how-to-find-operation-details">
          this page
        </a>{' '}
        for more information.
        <br />
        After that, please choose your case description from the items below.
      </p>
    ),
  },
  {
    label: 'Transaction is pending for too long',
    text: () => (
      <p>
        If your transaction is pending for too long, you can manage it via your
        wallet. We can’t make it faster or cancel it. If the transaction is on
        Harmony side, make sure you use{' '}
        <a href="https://docs.harmony.one/home/network/wallets/browser-extensions-wallets/metamask-wallet">
          recommended settings
        </a>{' '}
        for Harmony network.
      </p>
    ),
  },
  {
    label: 'Operation has been in progress for too long',
    text: () => (
      <p>
        Normally it takes less than 20 minutes per step to complete a
        transaction. Delays are also possible but they won't affect your funds.
        <br />
        If your operation is in progress on the final step for more than an
        hour, you can fill a form below. Note that your request will be ignored
        if you send it earlier.
        <br />
      </p>
    ),
    details: () => (
      <p>
        <ul>
          <li>
            Please use this form only if your bridge operation is stuck for more
            than 1 hour. Note that your request will be ignored if you send it
            earlier or if operation was ended with success soon.
            {/*If there are many operations in progress, it's usually because of global RPC issues. In this case, the support team can't make it faster for you.*/}
          </li>
          <li>
            Please mention what service did you use for your operation, if you
            didn't use Horizon interface on bridge.harmony.one directly. Check
            all the provided information before submitting. We need all the data
            in text format. If you don't have operation ID, include any
            transaction hash associated with the operation or at least mention
            operation day and time with a timezone.
          </li>
          <li>
            After submitting, check your email for an automated response. Please
            reply with a screenshot of your operation (it's page / bridge
            explorer) and any other details you want to add.
          </li>
          <li>
            If you didn't receive the confirmation email, you most likely won't
            get our reply. In this case, please check Spam folder and your mail
            settings. If this doesn't help, please send another form with
            different email. Please mention that it’s a double.
          </li>
        </ul>
        {/*<img src="forms/example_1.png" width="100%" />*/}
      </p>
    ),
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=6a7c3bd6-cf1e-4b4f-b91f-1133b68e2fc3',
  },
  {
    label: 'I bridged my tokens but only received 0.01 ONE in my account',
    text: () => (
      <p>
        <span>0.01 ONE</span> is provided to every new wallet that bridged for
        the first time to help with transaction fee on the Harmony network. If
        you received it, most likely your operation was completed successfully,
        and our tokens are in your account, but not displayed in your wallet.
        <br />
        Bridge does not swap tokens, it only provides wrapped tokens. For the
        token that you bridged, you have received wrapped token to your account.
        To find out which one, you can refer{' '}
        <a
          href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/what-token-will-i-get-after-bridge"
          target="_blank"
          rel="noreferrer"
        >
          to this page
        </a>
        . <br />
        If you don't see that token in your account, find the bridged token
        address using{' '}
        <a
          href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/how-to-find-a-bridged-token-address"
          target="_blank"
          rel="noreferrer"
        >
          this guide
        </a>{' '}
        and add it to your wallet to see the correct balance as shown{' '}
        <a
          href="https://docs.harmony.one/home/general/horizon-bridge/adding-tokens"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>
        . If you have problems with finding or adding a token, please ask for
        help in community groups.
      </p>
    ),
  },
  {
    label: 'Operation status is success, but I can’t find my tokens',
    text: () => (
      <p>
        Bridge does not swap tokens, it only provides wrapped tokens. For the
        token that you bridged, you have received wrapped token to your account.
        To find out which one, you can refer{' '}
        <a
          href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/what-token-will-i-get-after-bridge"
          target="_blank"
          rel="noreferrer"
        >
          to this page
        </a>
        .
        <br />
        If you don't see that token in your account, find the bridged token
        address using{' '}
        <a
          href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/how-to-find-a-bridged-token-address"
          target="_blank"
          rel="noreferrer"
        >
          this guide
        </a>{' '}
        and add it to your wallet to see the correct balance as shown{' '}
        <a
          href="https://docs.harmony.one/home/general/horizon-bridge/adding-tokens"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>
        . If you have problems with finding or adding a token, please ask for
        help in community groups.
        <br />
        Note that:
        <ul>
          <li>
            {' '}
            Bridge is not a swap, and you won't receive ONE if you weren't
            bridging ONE token.{' '}
          </li>
          <li>
            {' '}
            A token address is never the same in the different networks, even
            when a symbol is the same.
          </li>
        </ul>
        <br />
        If you added a token and tokens aren’t shown, check that:
        <ul>
          <li> you added a token to the receiver wallet of your operation.</li>
          <li>
            {' '}
            the receiver address of your operation is correct. If you found out
            that you made a mistake in the address, we can’t help you with that.
            You can reach your funds only if you have access to the wallet.
          </li>
          <li>
            {' '}
            the receiver wallet is connected to the correct network. For
            example, if you bridged tokens to Harmony, you need to be connected
            to Harmony mainnet.
          </li>
          <li>
            {' '}
            you’ve added a token that you really received. Check the transaction
            data. If you found out that you received a token that you didn’t
            suppose to get, see{' '}
            <a href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/i-am-confused-with-a-bridged-token-type">
              this page
            </a>{' '}
            .
          </li>
          <li>
            {' '}
            tokens haven’t been transferred after the bridge. If you used some
            service that uses Horizon bridge for one of the swapping steps, make
            sure that the next step wasn’t started.
          </li>
        </ul>
        <br />
        If a correct balance isn’t shown after you added a token, and you have
        double-checked everything, fill in the form below. It’s required to
        include a token address you added and a wallet you added it to.
      </p>
    ),
    details: () => (
      <p>
        <ul>
          <li>
            It’s required to include a token address you added and a wallet you
            added it to.
          </li>
          <li>
            Please mention what service did you use for your operation, if you
            didn't use Horizon interface on bridge.harmony.one directly. Check
            all the provided information before submitting. We need all the data
            in text format. If you don't have operation ID, include any
            transaction hash associated with the operation or at least mention
            operation day and time with a timezone.
          </li>
          <li>
            After submitting, check your email for an automated response. You
            can reply with screenshots and any other details you want to add.
          </li>
          <li>
            If you didn't receive the confirmation email, you most likely won't
            get our reply. In this case, please check Spam folder and your mail
            settings. If this doesn't help, please send another form with
            different email. Please mention that it’s a double.
          </li>
        </ul>
        {/*<img src="forms/example_1.png" width="100%" />*/}
      </p>
    ),
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=fb4de9c6-8f00-4e3b-b2e1-6df5763ff03b',
  },
  {
    label: 'I’m confused with a bridged token type',
    text: () => (
      <p>
        If you received something you didn’t suppose to get, first, look if your
        token has any liquidity. You might not expect to receive a mapped token.
        Look{' '}
        <a href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/what-token-will-i-get-after-bridge">
          here
        </a>{' '}
        if you got a token you supposed to get after the bridge. You can get use
        of your mapped token: look for swapping options in swap or exchange
        services or ask about available DEX in the Harmony community groups. If
        there are no options that suit your interests, you can bridge your
        tokens back. If you don’t know how to bridge back, see{' '}
        <a href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/i-dont-know-how-to-bridge-my-token">
          this page
        </a>
        .
        <br />
        <br />
        If you have an incorrectly bridged token with an extra wrap,{' '}
        <a href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/how-to-bridge-back-an-incorrectly-bridged-token">
          here
        </a>{' '}
        you can find instructions with example cases. If your case is not in the
        list, you can ask advanced users in community groups for help or send a
        support request.
      </p>
    ),
    details: () => (
      <p>
        <ul>
          <li>
            {' '}
            Please complete the form below only if you have multiple prefix
            token like bsc1bsc***. Otherwise, your request will be ignored.
            Please make sure that there's no example instruction for your case{' '}
            <a href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/how-to-bridge-back-an-incorrectly-bridged-token">
              here
            </a>
            . If you have the same token with fewer wraps than the example,
            start with the step corresponding to your token symbol. For example,
            if you have 1bscONE, start the instruction for bsc1bsc1bscONE from
            the 1bscONE → bscONE step.
          </li>
          <li>
            The reply time can be longer than usual because support team top
            priority is fixing errors. You can also ask for help in the
            community groups, there is a chance you get help faster.
          </li>
          <li>
            Please mention what service did you use for your operation, if you
            didn't use Horizon interface on bridge.harmony.one directly. Check
            all the provided information before submitting. We need all the data
            in text format. If you don't have operation ID, include any
            transaction hash associated with the operation or at least mention
            operation day and time with a timezone.
          </li>
          <li>
            After submitting, check your email for an automated response. You
            can reply with screenshots and any other details you want to add.
          </li>
          <li>
            Please don’t move your funds after the request. If you do, update it
            by replying to the confirmation email.
          </li>
          <li>
            If you didn't receive the confirmation email, you most likely won't
            get our reply. In this case, please check Spam folder and your mail
            settings. If this doesn't help, please send another form with
            different email. Please mention that it’s a double.
          </li>
        </ul>
      </p>
    ),
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=1430901b-62e2-4eea-a44e-7a60c960eb57',
  },
  {
    label:
      'Deposited ONEs weren’t withdrawn for failed HMY→BSC / HMY→ETH operation',
    text: () => (
      <p>
        The deposits of all failed transactions are returned automatically after
        the 1-hour timeout. If you do not receive the deposit back even after
        the timeout, check your operation status. Use{' '}
        <a href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/how-to-find-operation-details">
          this page
        </a>{' '}
        if you don't know how to do it. If there is no hash on deposit
        withdrawal step, then fill the form below.
        <br />
        {/*<img src="forms/example_1.png" width="100%" />*/}
      </p>
    ),
    details: () => (
      <p>
        <ul>
          <li>
            Please complete the form below only if you do not receive the
            deposit back even after the 1-hour timeout. Otherwise, your request
            will be ignored. Please make sure that there is no hash on deposit
            withdrawal step of your operation.
          </li>
          <li>
            Please mention what service did you use for your operation, if you
            didn't use Horizon interface on bridge.harmony.one directly. Check
            all the provided information before submitting. We need all the data
            in text format. If you don't have operation ID, include any
            transaction hash associated with the operation or at least mention
            operation day and time with a timezone.
          </li>
          <li>
            After submitting, check your email for an automated response. Please
            reply with a screenshot of your operation (it's page / bridge
            explorer) and any other details you want to add.
          </li>
          <li>
            If you didn't receive the confirmation email, you most likely won't
            get our reply. In this case, please check Spam folder and your mail
            settings. If this doesn't help, please send another form with
            different email. Please mention that it’s a double.
          </li>
        </ul>
      </p>
    ),
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=6d9caa8e-2f02-4d20-9503-687ed3cdfab2',
  },
  {
    label: 'Bridge error, bridged amount gone',
    text: () => (
      <p>
        This is the case when your bridged amount was locked/burnt on the first
        chain, but not unlocked/minted on the other because of an error.
        <br />
        This is your case if all this conditions are met:
        <ul>
          <li>
            {' '}
            Your operation status is “error”. Use{' '}
            <a href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/how-to-find-operation-details">
              this page
            </a>{' '}
            if you don't know how to check it.
          </li>
          <li>
            {' '}
            You have lock/burn Harmony bridge transaction in your first chain
            explorer on the same amount and time as the operation. However,
            there is no successful bridge operation with this transaction.{' '}
          </li>
        </ul>
        {/*<br />*/}
        {/*<img src="forms/example_1.png" width="100%" />*/}
      </p>
    ),
  },
  {
    label: 'Operation canceled, bridged amount gone',
    text: () => (
      <p>
        This is the case when your bridged amount was locked/burnt on the first
        chain, but your operation got canceled. If you were experiencing
        connection issues during the operation, it’s probably your case.
        <br />
        This is your case if all this conditions are met:
        <ul>
          <li>
            {' '}
            Your operation status is “canceled” (usually transaction was
            rejected by timeout). Use{' '}
            <a href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/how-to-find-operation-details">
              this page
            </a>{' '}
            if you don't know how to check it.
          </li>
          <li>
            {' '}
            You have lock/burn Harmony bridge transaction in your first chain
            explorer on the same amount and time as the operation. However,
            there is no other successful bridge operation with this transaction.{' '}
          </li>
        </ul>
        {/*<br />*/}
        {/*<img src="forms/example_1.png" width="100%" />*/}
      </p>
    ),

    // If your operation is in progress or ended with success, or if your operation has nothing to do with Horizon Bridge, you won't get any help from this request.
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=5d01138b-30fb-4a94-b641-26065b53b5ae',
  },
  {
    label: "Tokens lost, but I don't know my operation status",
    text: () => (
      <p>
        If you perform your operation on bridge.harmony.one, you can find the
        operation details on your operation page. Also, you can always find your
        operation in the bridge operation explorer. Please refer to{' '}
        <a href="https://docs.harmony.one/home/general/bridges/horizon-bridge/bridge-faqs/how-to-find-operation-details">
          this page
        </a>{' '}
        for more information.
        <br />
        If you couldn't find your operation, make sure you used a correct wallet
        when searching. It should be the one that you used for your operation.
        <br />
        If you still can't find the operation, you can fill in the form by the
        link below. Note that reply time can be longer for such cases.
      </p>
    ),
    details: () => (
      <p>
        <ul>
          <li>
            Note that we can't help if Horizon bridge wasn't used for the
            operation.
            <br />
            If you made a tokens transfer via your wallet without using Horizon
            bridge interface or other service, that means you didn't bridge
            them. You just transferred them to another wallet in the same
            network. If this is your case, try searching your tokens there.
            <br />
            If you performed your operation via a service that doesn't use
            Horizon bridge, please address to that service support.
          </li>
          <li>
            Please mention what service did you use for your operation, if you
            didn't use Horizon interface on bridge.harmony.one directly. Check
            all the provided information before submitting. We need all the data
            in text format. If you don't have operation ID, include any
            transaction hash associated with the operation or at least mention
            operation day and time with a timezone.
          </li>
          <li>
            After submitting, check your email for an automated response. You
            can reply with screenshots and any other details you want to add.
          </li>
          <li>
            If you didn't receive the confirmation email, you most likely won't
            get our reply. In this case, please check Spam folder and your mail
            settings. If this doesn't help, please send another form with
            different email. Please mention that it’s a double.
          </li>
        </ul>
      </p>
    ),
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=495f2b1f-ac01-42fa-b21a-eb0b1f8b9cd7',
  },
  {
    label:
      'I am getting an error saying not enough eth for paying gas, what does it mean?',
    text: () => (
      <p>
        This means you don't have enough ONE tokens for paying Ethereum gas when
        doing Harmony to Ethereum transfer. Note that, bridge validators pay the
        ethereum gas fee and you pay the bridge validators using ONE tokens.
        {/*    TODO: BNB for Bsc etc??; как насчет сделать сообщения об ошибках понятными для юзера?*/}
      </p>
    ),
  },
  {
    label: 'I can’t bridge because of an error',
    text: () => (
      <p>
        There can be many possible causes. Sometimes the reason is clear from
        the error message (for example, low balance).
        <br /> Often there is a problem with the wallet connection. Try these
        steps to solve it:
        <ul>
          <li>
            {' '}
            Make sure your browser and the wallet extension are updated to the
            latest version{' '}
          </li>
          <li>
            ONE wallet is deprecated and no longer supported by the Horizon
            bridge. If you still use it, please switch to MetaMask.
          </li>
          <li> Make sure that your browser doesn’t block pop-up windows.</li>
          <li> Try to clear the cache and relogin.</li>
          <li>
            {' '}
            Check{' '}
            <a href="https://docs.harmony.one/home/network/wallets/browser-extensions-wallets/metamask-wallet">
              here
            </a>{' '}
            if your wallet is set up correctly.
          </li>
          <li> Try using another browser or/and wallet extension.</li>
          <li> If you use a mobile version, try it on the desktop.</li>
        </ul>
        If you’ve checked your settings, but you still have errors, please share
        your problem in the #support or #bridge{' '}
        <a href="https://discord.com/invite/YJ6kgEZ5ed">Discord</a> channel.
        {/*TODO: + form?*/}
      </p>
    ),
  },
  {
    label:
      'By mistake sent tokens to an exchange wallet (e.g. Binance exchange)',
    text: () => (
      <p>
        Unfortunately, your tokens are permanently lost and not recoverable.
      </p>
      // TODO: true?
    ),
  },
  {
    label: 'I sent tokens to a wallet that doesn’t support the network I used',
    text: () => (
      <p>
        If you can’t open your wallet in the network where your tokens were
        sent, we can’t assist. You can try to reach a support of the service
        that gave you this account.
      </p>
    ),
  },
  {
    label: 'By mistake sent tokens to a wrong address or a token address',
    text: () => (
      <p>
        Unfortunately, we can't help in such case. We don't have access needed
        to transfer tokens between accounts.
      </p>
    ),
  },
  {
    label: 'I have a question about the Horizon bridge',
    text: () => (
      <p>
        Please refer to{' '}
        <a
          href="https://docs.harmony.one/home/general/bridges/horizon-bridge"
          target="_blank"
        >
          this page
        </a>
        . Here you can find our tutorials and FAQ. You also can address to
        Harmony community in Discord or Telegram. Please beware of scammers.
        Remember, admins never DM you first.
      </p>
    ),
  },
  //TODO: scam?
];
