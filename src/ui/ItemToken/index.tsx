import * as React from 'react';
import { Box } from 'grommet';
import cn from 'classnames';
import { Text } from 'components/Base/components/Text';
import * as styles from './styles.styl';
import { TOKEN } from 'stores/interfaces';

const icons: Record<TOKEN, string> = {
  [TOKEN.ALL]: '/busd.svg',
  [TOKEN.BUSD]: '/busd.svg',
  [TOKEN.LINK]: '/link.png',
  [TOKEN.ERC20]: '/eth.svg',
  [TOKEN.ETH]: '/eth.svg',
  [TOKEN.ERC721]: '/eth.svg',
  [TOKEN.HRC721]: '/one.svg',
  [TOKEN.ERC1155]: '/eth.svg',
  [TOKEN.HRC1155]: '/one.svg',
  [TOKEN.HRC20]: '/one.svg',
  [TOKEN.ONE]: '/one.svg',
};

export const ItemToken = ({ selected, onClick, tokenType }) => {
  const icon = icons[tokenType];

  return (
    <Box direction="row">
      <Box
        className={cn(styles.itemToken, selected ? styles.selected : '')}
        onClick={() => onClick(tokenType)}
      >
        <img className={styles.imgToken} src={icon} />
        <Text>{tokenType.toUpperCase()}</Text>
      </Box>
    </Box>
  );
};
