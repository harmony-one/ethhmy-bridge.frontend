import React from 'react';
import { Box } from 'grommet';
import { Title } from './Base/components/Title';
import * as styles from './info-styles.styl';

export const InfoEarn = ({ title }: { title: string }) => (
  <Box className={styles.infoContainer} pad={{ horizontal: 'large', top: 'large' }}>
    {title ? (
      <Box direction="row" justify="center" margin={{ bottom: 'medium' }}>
        <Title>{title}</Title>
      </Box>
    ) : null}
    <div>
      <p>
        The higher the number of addresses and amount of funds interacting with the bridge, the higher the anonymity
        guarantees of the bridge. <b>Let's earn yield and protect our privacy!</b>
        <ul>
          <li>
            1. In order to earn rewards, users must deposit secretTokens to a rewards contract by choosing Earn.
            <br />{' '}
            <span>
              Note: If you have created a secretToken, please make sure you have already created the viewing key to see
              your balances. You can always create a viewing key by clicking on lock icon.
            </span>
          </li>
          <li>
            2. Once users deposit secretTokens to the rewards contracts, they will start to accumulate bridge rewards in
            secretSCRT. In order to view your rewards balance and your deposited secret tokens make sure you have
            created a viewing key for each reward pool.
          </li>
          <li>
            3. When users withdraw or deposit secretTokens from/to rewards contract, the bridge rewards they have
            accumulated will be automatically transferred to their wallet (Keplr)
          </li>
          <li>
            4. Users can use Keplr app to convert secretSCRT (privacy token) to SCRT (Secret Network native coin) using
            Keplr app to participate in staking.
          </li>
        </ul>
      </p>
    </div>
  </Box>
);
