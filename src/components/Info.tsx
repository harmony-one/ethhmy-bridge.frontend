import React from 'react';
import { Box } from 'grommet';
import { Title } from './Base/components/Title';

export const Info = () => (
  <Box pad={{ horizontal: 'large', top: 'large' }}>
    <Title>About Harmony Soccer Players</Title>
    <div>
      <p>
        This open source project give you the chance to collect and own your
        favorite smart contract soccer player. If someone buy your player, you
        will receive 13% reward and 2% is allocated in the mint account for
        service and maintenance.
      </p>
      <p>
        The soccer player smart contracts are automatically placed on the
        marketplace, so others can collect them. (please keep in mind that all
        design of the players is irrelevant in this open source project, and may
        be subject to changes in the future, what is important is the smart
        contract with the unique token player id, that remains unique)
      </p>
    </div>
  </Box>
);
