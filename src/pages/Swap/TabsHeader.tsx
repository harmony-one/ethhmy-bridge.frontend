import React from 'react';

const flexRowSpace = <span style={{ flex: 1 }}></span>;

const Tab: React.FC<{ name: string }> = ({ name }) => {
  const isSelected = window.location.hash === `#${name}`;

  return (
    <span
      style={{
        paddingLeft: '0.5em',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: isSelected ? 'bold' : null,
        textDecoration: isSelected ? 'underline' : null,
      }}
      onClick={() => {
        if (!isSelected) {
          window.location.hash = name;
        }
      }}
    >
      {name}
    </span>
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
          flexDirection: 'row',
          paddingBottom: '1em',
        }}
      >
        <Tab name="Swap" />
        <Tab name="Provide" />
        <Tab name="Withdraw" />
        {flexRowSpace}
      </div>
    );
  }
}
