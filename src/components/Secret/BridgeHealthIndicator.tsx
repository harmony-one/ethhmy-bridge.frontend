import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { ISignerHealth } from '../../stores/interfaces';
import { Icon } from 'semantic-ui-react';

export const BridgeHealth = observer((props: { from_scrt?: boolean }) => {
  const { signerHealth } = useStores();

  const [healthy, setHealth] = useState<boolean>(true);

  useEffect(() => {
    const signers: ISignerHealth[] = signerHealth.allData;

    if (signers.length === 0) {
      return;
    }

    let filtered = signers.filter(s => {
      return props.from_scrt ? s.from_scrt : s.to_scrt;
    });

    setHealth(parseHealth(filtered));
  }, [props.from_scrt, signerHealth.allData]);

  const parseHealth = (signers: ISignerHealth[]): boolean => {
    for (const signer of signers) {
      if (signer.signer === process.env.LEADER_ACCOUNT && signers.length >= Number(process.env.SIG_THRESHOLD)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div>
      {healthy ? (
        <div>
          <Icon className={'circle'} color={'green'} />
          Live
        </div>
      ) : (
        <div>
          <Icon className={'circle'} color={'red'} />
          Down
        </div>
      )}
    </div>
  );
});
