import React from 'react';
import '../override.css';
import { UserStoreEx } from 'stores/UserStore';
import { InfoBox } from '../../../components/Swap/InfoBox';
import PoolRow from '../../../components/Swap/PoolRow';

export class PoolsTab extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <InfoBox />
        <div>
          <PoolRow />
        </div>
      </div>
    );
  }
}
