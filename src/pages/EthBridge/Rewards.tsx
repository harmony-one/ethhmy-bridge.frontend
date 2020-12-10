import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import * as styles from './wallet-balances.styl';
import { useStores } from '../../stores';
import { Button } from 'components/Base';
import { DepositRewards, Redeem } from '../../blockchain-bridge/scrt';

export const Rewards = observer(() => {
  const { user, userMetamask, actionModals, exchange, tokens } = useStores();

  return (
    <Box
      direction="column"
      className={styles.walletBalances}
      margin={{ vertical: 'large' }}
    >

      <Box className={styles.container}>
        <Box direction="column">
          <Box direction="row" justify="between" margin={{ bottom: 'xsmall' }}>
            <Box direction="row" align="center">
              <Button
                bgColor="#00ADE8"
                style={{ width: 180 }}
                onClick={() => {
                  DepositRewards({
                    cosmJS: user.cosmJS,
                    recipient: "secret1phq7va80a83z2sqpyqsuxhl045ruf2ld6xa89m",
                    address: "secret15c8538ptyx40n5zvnccy5v9ffuejj9w8090vkp",
                    amount: "1000000000000000"})
                }}
              >
                {'Earn Rewards'}
              </Button>
              <Button
                bgColor="#00ADE8"
                style={{ width: 180 }}
                onClick={() => {
                  Redeem({
                    cosmJS: user.cosmJS,
                    address: "secret1phq7va80a83z2sqpyqsuxhl045ruf2ld6xa89m",
                    amount: "1000000000000000"
                  }).catch(reason =>
                    console.log(`Failed to redeem: ${reason}`)
                  )
                }}

              >
                {'Unearn Rewards'}
              </Button>
            </Box>
          </Box>
      </Box>
    </Box>
    </Box>
  );
});
