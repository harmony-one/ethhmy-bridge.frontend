import React, { useState } from 'react';
import SoftTitleValue from '../../components/Earn/SoftTitleValue';
import { flexRowSpace, TokenDisplay } from './index';
import { Image, Popup } from 'semantic-ui-react';
import cn from 'classnames';
import * as styles from './styles.styl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Icon } from 'components/Base';

export const TokenInfoRow = (props: { token: TokenDisplay; balance?: number; onClick?: any }) => {
  const [copied, setCopied] = useState<boolean>(false);

  return (
    <div style={{ display: 'flex' }}>
      <div className={cn(styles.tokenInfoRow)} onClick={props.onClick}>
        <div className={cn(styles.tokenInfoItemsLeft)}>
          <Image src={props.token.logo} rounded style={{ borderRadius: '24px', height: '24px', width: '24px' }} />
          <SoftTitleValue title={props.token.symbol} subTitle={props.token.symbol} />
        </div>
        {flexRowSpace}
        <h3 className={cn(styles.tokenInfoItemsRight)}>{props.token.address ?? 'native'}</h3>
      </div>
      <h3 style={{ margin: 'auto' }} hidden={!props.token.address}>
        <CopyToClipboard
          text={props.token.address}
          onCopy={() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 5000);
          }}
        >
          <Icon glyph="PrintFormCopy" size="1em" color={copied ? 'green' : null} />
        </CopyToClipboard>
      </h3>
    </div>
  );
};
