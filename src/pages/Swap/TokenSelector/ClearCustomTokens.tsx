import * as styles from './styles.styl';
import cn from 'classnames';
import React from 'react';
import { Text } from '../../../components/Base/components/Text';
import LocalStorageTokens from '../../../blockchain-bridge/scrt/CustomTokens';

export const ClearCustomTokensButton = () => {
  return (
    <button
      className={cn(styles.clearTokenButton, styles.ripple)}
      onClick={() => {
        LocalStorageTokens.clear();
      }}
    >
      <Text size="medium" color={'red'}>
        Clear Custom Tokens
      </Text>
    </button>
  );
};
