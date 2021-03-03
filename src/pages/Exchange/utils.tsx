
import * as React from 'react';
import Zoom from 'react-reveal/Zoom';
import { Box } from 'grommet';
import { Text } from 'components/Base';

export const tokenLocked = (user: any) => <Zoom bottom>
    <Box direction="column">
        <Text bold color="#c5bb2e">Warning</Text>
        <Text margin={{ top: 'xxsmall', bottom: 'xxsmall' }}>Everything inside Secret Network is private by default, in order for you to view this token balance, it is required a viewing key.
        </Text>
        <Box style={{ cursor: 'pointer' }} onClick={async () => {
            try {
                await user.keplrWallet.suggestToken(user.chainId, user.snip20Address);
            } catch (error) {
                console.log(error);
            }
        }}>
            <Text bold>Created one here</Text>
        </Box>

    </Box>
</Zoom>