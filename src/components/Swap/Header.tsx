import React from 'react';
import * as styles from './styles.styl';
import cn from 'classnames';
import { Box, Text } from 'grommet';
import { useHistory } from 'react-router';
import { useStores } from '../../stores';
// import { Route, Switch } from 'react-router';
// import { Tokens } from '../../pages/Tokens';
// import { SwapPage } from '../../pages/Swap';


const SwapHeader = props => {
  const { routing } = useStores();

  const history = useHistory();
  const isSwap = history.location.pathname === '/swap';
  const isPools = history.location.pathname === '/pool';
  return (<div className={cn(styles.swapHeader)}>
    <Box
      className={cn(styles.itemToken, isSwap ? styles.selected : '')}
      onClick={() => {
        routing.push(`/swap`);
      }}
    >
      <Text>Swap</Text>
    </Box>
    <Box
      className={cn(styles.itemToken, isPools ? styles.selected : '')}
      onClick={() => {
        routing.push(`/pools`);
      }}
    >
      <Text>Pools</Text>
    </Box>
    {/*<a className={cn(styles.scrtAssetBalance)}>Swap</a>*/}
    {/*<text className={cn(styles.scrtAssetBalance)}>Pools</text>*/}
  </div>);
};

export default SwapHeader;