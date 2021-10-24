import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { useEffect } from 'react';
import { Info } from './Info';
import { InfoNew, InfoNew2 } from './InfoNew';
import { Box } from 'grommet';
import { Text } from './Base/components/Text';

export const InfoModal = observer(() => {
  const { user, exchange, actionModals } = useStores();

  useEffect(() => {
    exchange.getConfig();
  }, []);

  useEffect(() => {
    actionModals.open(
      () => (
        <Box pad="large">
          <Text>
            <b>The work of the bridge is temporarily suspended.</b>
            <br />
            <br />
            Due to congestion in the bridge and slowness in getting rpc
            response, we have many pending bridge operations.
            <br />
            We need couple of hours to fix all the pending/stuck transfers.
            <br />
            We have temporarily disabled new operations and will reopen as soon
            as we fix the issues.
            <br />
            <br />
            Sorry for the temporary inconvenience.
          </Text>
        </Box>
      ),
      {
        title: '',
        applyText: 'Got it',
        closeText: '',
        noValidation: true,
        width: '700px',
        showOther: true,
        onApply: () => {
          return Promise.resolve();
        },
      },
    );
  }, []);
  //
  useEffect(() => {
    if (!user.isInfoNewReading) {
      actionModals.open(() => <InfoNew2 title="Important Notice" />, {
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
      });
    }
  }, [user.isInfoNewReading]);

  return <></>;
});
