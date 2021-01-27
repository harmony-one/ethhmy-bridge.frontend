import React from 'react';
import { Button, Container } from 'semantic-ui-react';
import { UserStoreEx } from 'stores/UserStore';
import { flexRowSpace, swapContainerStyle } from '.';
import { AssetRow } from './AssetRow';
import { TabsHeader } from './TabsHeader';

export class WithdrawTab extends React.Component<
  Readonly<{ user: UserStoreEx }>
> {
  constructor(props: Readonly<{ user: UserStoreEx }>) {
    super(props);
  }

  render() {
    return (
      <Container style={swapContainerStyle}>
        <TabsHeader />
      </Container>
    );
  }
}
