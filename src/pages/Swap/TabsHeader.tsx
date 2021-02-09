import React from 'react';

const Tab: React.FC<{ name: string }> = ({ name }) => {
  const isSelected = window.location.hash === `#${name}`;

  return (
    <strong
      style={{
        padding: '0.3em',
        marginRight: '1em',
        fontSize: '16px',
        cursor: 'pointer',
        borderRadius: '10px',
        background: isSelected ? 'whitesmoke' : null,
      }}
      onClick={() => {
        if (!isSelected) {
          window.location.hash = name;
        }
      }}
    >
      {name}
    </strong>
  );
};

export class TabsHeader extends React.Component {
  constructor(props: Readonly<{}>) {
    super(props);
  }

  render() {
    return (
      <div
        style={{
          display: 'flex',
          paddingBottom: '1em',
        }}
      >
        <Tab name="Swap" />
        <Tab name="Provide" />
        <Tab name="Withdraw" />
      </div>
    );
  }
}
