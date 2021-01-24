import React from 'react';

const flexRowSpace = <span style={{ flex: 1 }}></span>;

export class SwapHeader extends React.Component {
  constructor(props: Readonly<{}>) {
    super(props);
  }

  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          paddingBottom: '1em',
        }}
      >
        <strong style={{ paddingLeft: '0.5em', fontSize: '16px' }}>Swap</strong>
        {flexRowSpace}
      </div>
    );
  }
}
