import React, { useState } from 'react';
import { Icon, Message, Popup } from 'semantic-ui-react';

export const SwapFooter = () => {
  const [iconBackground, setIconBackground] = useState('whitesmoke');

  return (
    <div>
      Secured by{' '}
      <a href="https://scrt.network" target="_blank" rel="noreferrer">
        Secret Network
      </a>
      <Popup
        trigger={
          <Icon
            name="help"
            circular
            size="tiny"
            style={{
              marginLeft: '0.5rem',
              background: iconBackground,
              verticalAlign: 'middle',
            }}
            onMouseEnter={() => setIconBackground('rgb(237, 238, 242)')}
            onMouseLeave={() => setIconBackground('whitesmoke')}
          />
        }
        content="Secret Network's privacy-by-default design protects your swaps from front-running attacks and helps secure your trading and transactions."
        position="top center"
      />
    </div>
  );
};
