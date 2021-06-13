import React, { ReactElement } from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react';
import { useStores } from 'stores';
import * as styles from './ExplorerLinks.styl';
import { Text } from './Base';
import { NETWORK_ICON } from 'stores/names';
import { NETWORK_TYPE } from 'stores/interfaces';

const zeroAdresses = [
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  '0x0000000000000000000000000000000000000001',
];

export const OneTx = ({
  tx,
  children,
}: {
  tx: string;
  children: ReactElement;
}) => {
  return (
    <Box direction="row" align="start">
      <Text size="small">
        <a
          href={`${process.env.HMY_EXPLORER_URL}/tx/${tx}`}
          className={styles.addressLink}
        >
          {children}
        </a>
      </Text>
    </Box>
  );
};

export const OneToken = ({ address }: { address: string }) => {
  let href = process.env.HMY_EXPLORER_URL;
  if (zeroAdresses.indexOf(address) == -1) {
    href = `${href}/token/${address}`;
  }
  return (
    <Box direction="row" align="center">
      <img
        className={styles.imgToken}
        style={{ height: 16, width: 16 }}
        src="/one.svg"
      />
      <Text size="small">
        <a href={href} className={styles.addressLink}>
          {address}
        </a>
      </Text>
    </Box>
  );
};

export const OneAddress = ({ address }: { address: string }) => {
  let href = process.env.HMY_EXPLORER_URL;
  if (zeroAdresses.indexOf(address) == -1) {
    href = `${href}/address/${address}`;
  }
  return (
    <Box direction="row" align="center">
      <img
        className={styles.imgToken}
        style={{ height: 16, width: 16 }}
        src="/one.svg"
      />
      <Text size="small">
        <a href={href} className={styles.addressLink}>
          {address}
        </a>
      </Text>
    </Box>
  );
};

export const BridgedToken = observer(
  ({ address, network }: { address: string; network: NETWORK_TYPE }) => {
    const { exchange } = useStores();
    let explorerUrl = exchange.getExplorerByNetwork(network);

    if (explorerUrl.endsWith('/')) {
      explorerUrl = explorerUrl.slice(0, -1);
    }

    let href = explorerUrl;

    if (zeroAdresses.indexOf(address) == -1) {
      href = `${explorerUrl}/token/${address}`;
    }

    return (
      <Box direction="row" align="center">
        <img
          className={styles.imgToken}
          style={{ height: 16, width: 16 }}
          src={NETWORK_ICON[network] ?? NETWORK_ICON.ETHEREUM}
        />
        <Text size="small">
          <a href={href} className={styles.addressLink}>
            {address}
          </a>
        </Text>
      </Box>
    );
  },
);

export const BridgedAddress = observer(
  ({ address, network }: { address: string; network: NETWORK_TYPE }) => {
    const { exchange } = useStores();
    let explorerUrl = exchange.getExplorerByNetwork(network);

    if (explorerUrl.endsWith('/')) {
      explorerUrl = explorerUrl.slice(0, -1);
    }

    let href = explorerUrl;

    if (zeroAdresses.indexOf(address) == -1) {
      href = `${explorerUrl}/address/${address}`;
    }

    return (
      <Box direction="row" align="center">
        <img
          className={styles.imgToken}
          style={{ height: 16, width: 16 }}
          src={NETWORK_ICON[network] ?? NETWORK_ICON.ETHEREUM}
        />
        <Text size="small">
          <a href={href} className={styles.addressLink}>
            {address}
          </a>
        </Text>
      </Box>
    );
  },
);
