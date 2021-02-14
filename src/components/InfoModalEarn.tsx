import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { useEffect } from 'react';
import { InfoEarn } from './InfoEarn';
import { useHistory } from 'react-router';

export const InfoModalEarn = observer(() => {
  const { user, actionModals } = useStores();
  const history = useHistory();

  useEffect(() => {
    if (history.location.pathname !== '/earn') {
      return;
    }

    if (!user.isInfoEarnReading) {
      actionModals.open(() => <InfoEarn title="Improve privacy guarantees and earn SCRT rewards" />, {
        title: '',
        applyText: 'Got it',
        closeText: '',
        noValidation: true,
        showOther: true,
        onApply: () => {
          user.setInfoEarnReading();
          return Promise.resolve();
        },
      });
    }
  }, [user.isInfoEarnReading]);

  return <></>;
});
