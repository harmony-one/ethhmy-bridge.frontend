import React from 'react';
import { Icon, Text } from '../../../../components/Base';
import { Spinner } from '../../../../ui';
import { Box } from 'grommet';
import { EXCHANGE_MODE, TOKEN } from '../../../../stores/interfaces';
import * as styles from '../../../Exchange/styles.styl';
import { Steps } from '../../../Exchange/Steps';
import { EXCHANGE_STEPS } from '../../../../stores/Exchange';
import { AddTokenPanel } from '../../../Exchange/AddTokenPanel';
import { observer } from 'mobx-react';
import { useStores } from '../../../../stores';

interface Props {}

export const Status: React.FC<Props> = observer(() => {
  const { exchange } = useStores();

  let icon = () => <Icon style={{ width: 50 }} glyph="RightArrow" />;
  let description = 'Approval';

  switch (exchange.actionStatus) {
    case 'fetching':
      icon = () => <Spinner />;
      description = '';
      break;

    case 'error':
      icon = () => <Icon size="50" style={{ width: 50 }} glyph="Alert" />;
      description = exchange.error;
      break;

    case 'success':
      icon = () => (
        <Box direction="column" align="center">
          <Box
            style={{
              background: '#1edb89',
              borderRadius: '50%',
            }}
          >
            <Icon
              size="50"
              style={{ width: 50, color: 'white' }}
              glyph="CheckMark"
            />
          </Box>
          <Box margin={{ vertical: 'small' }}>
            <Text>Success</Text>
          </Box>
          {exchange.operation.type === EXCHANGE_MODE.ETH_TO_ONE &&
          [
            TOKEN.ERC20,
            TOKEN.ETH,
            TOKEN.BUSD,
            TOKEN.LINK,
            TOKEN.ERC721,
            TOKEN.HRC721,
            TOKEN.ERC1155,
            TOKEN.HRC1155,
          ].includes(exchange.token) ? (
            <Box
              pad={{ horizontal: 'medium', vertical: 'small' }}
              style={{ background: 'white' }}
            >
              <Text style={{ textAlign: 'center' }} color="rgb(0, 173, 232)">
                Bridged assets can only be used in the Harmony ecosystem and
                currently no centralized exchange supports deposit of the
                bridged assets.
              </Text>
            </Box>
          ) : null}
        </Box>
      );
      description = '';
      break;
  }

  return (
    <Box
      direction="column"
      align="center"
      justify="center"
      fill={true}
      pad="medium"
      style={{ background: '#dedede40' }}
    >
      {icon()}
      <Box
        className={styles.description}
        margin={{ top: 'medium' }}
        pad={{ horizontal: 'small' }}
        style={{ width: '100%' }}
      >
        {description ? (
          <Text color="NWhite" style={{ textAlign: 'center' }}>
            {description}
          </Text>
        ) : null}
        <Box margin={{ top: 'medium' }} style={{ width: '100%' }}>
          <Steps />
          {exchange.step.id === EXCHANGE_STEPS.RESULT ? (
            <AddTokenPanel position="center" />
          ) : null}
        </Box>
        {/*{exchange.txHash ? (*/}
        {/*  <a*/}
        {/*    style={{ marginTop: 10 }}*/}
        {/*    href={EXPLORER_URL + `/tx/${exchange.txHash}`}*/}
        {/*    target="_blank"*/}
        {/*  >*/}
        {/*    Tx id: {truncateAddressString(exchange.txHash)}*/}
        {/*  </a>*/}
        {/*) : null}*/}
      </Box>
    </Box>
  );
});

Status.displayName = 'Status';
