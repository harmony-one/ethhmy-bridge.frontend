import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { useEffect } from 'react';
import { Info } from './Info';

export const InfoModal = observer(() => {
  const { user, actionModals } = useStores();

  useEffect(() => {
    if (!user.isInfoReading) {
      actionModals.open(
        () => <Info title="Welcome to Ethereum <> Secret Bridge" />,
        {
          title: '',
          applyText: 'Got it',
          closeText: '',
          noValidation: true,
          width: '1000px',
          showOther: true,
          onApply: () => {
            user.setInfoReading();
            return Promise.resolve();
          },
        },
      );
    }
  }, [user.isInfoReading]);

  return <></>;
});
