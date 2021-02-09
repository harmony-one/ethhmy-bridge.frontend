import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { useEffect } from 'react';
import { Info } from './Info';
import { InfoNew } from './InfoNew';

export const InfoModal = observer(() => {
  const { user, actionModals } = useStores();

  useEffect(() => {
    if (!user.isInfoReading) {
      actionModals.open(
        () => <Info title="Welcome to Ethereum <> Harmony Bridge" />,
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

  useEffect(() => {
    if (!user.isInfoNewReading) {
      actionModals.open(
        () => <InfoNew title="Important Notice" />,
        {
          title: 'Important Notice',
          applyText: 'Got it',
          closeText: '',
          noValidation: true,
          width: '800px',
          showOther: true,
          onApply: () => {
            user.setInfoNewReading();
            return Promise.resolve();
          },
        },
      );
    }
  }, [user.isInfoNewReading]);

  return <></>;
});
