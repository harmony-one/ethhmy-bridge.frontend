import React from 'react';
import { Box } from 'grommet';
import { Text, Title } from './Base';
import * as styles from './info-styles.styl';

export const InfoNew = ({ title }: { title: string }) => (
  <Box className={styles.infoContainer} pad="large">
    {title ? (
      <Box direction="row" justify="center" margin={{ bottom: 'medium' }}>
        <Title>{title}</Title>
      </Box>
    ) : null}
    <div>
      <Text color="NWhite">
        <p>Hi Horizon Bridge users,</p>
        <p>
          Due to the high Ethereum gas price, we had to update the bridge that
          will now require users to pay for the Ethereum network fee. Details
          are in the FAQ section. Please use the bridge cautiously, especially
          the Harmony to Ethereum transfers.
        </p>
        <p>
          The Horizon bridge has still the lowest cost for Ethereum to Harmony
          transfers, however Harmony to Ethereum transfers will be expensive (at
          high Ethereum gas price). The Ethereum gas cost for our bridge is
          comparable to every other bridge that is currently on Ethereum
          mainnet. For example, SecretNetwork bridge, IoTex bridge, etc.
        </p>
        <p>
          We have been working tirelessly on the trustless and gas-efficient
          version of the bridge to Ethereum, which will be rolled out sometime
          later this month. The cost of transferring assets from Harmony to
          Ethereum is expected to drastically improve. We will keep the
          community up to date on this release.
        </p>
        Thanks
        <br />
        Horizon bridge team
      </Text>
    </div>
  </Box>
);

export const InfoNew2 = ({ title }: { title: string }) => (
  <Box className={styles.infoContainer} pad="large">
    {title ? (
      <Box direction="row" justify="center" margin={{ bottom: 'medium' }}>
        <Title>{title}</Title>
      </Box>
    ) : null}
    <div>
      <Text color="NWhite">
        <p>Hi Horizon Bridge users,</p>
        <p>
          We saw some users trying to directly send their bridged tokens (for
          example, 1BUSD) to Binance. This will not work and it will result in
          permanent loss of your tokens. The bridged tokens can only be used in
          the Harmony network and cannot be sent out of the Harmony network. The
          only way to send it out is by bridging it back.
        </p>
        Thanks
        <br />
        Horizon bridge team
      </Text>
    </div>
  </Box>
);
