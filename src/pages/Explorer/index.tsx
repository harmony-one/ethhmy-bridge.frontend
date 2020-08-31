import * as React from 'react';
import { Box } from 'grommet';
import { Text } from 'components/Base';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { useEffect } from 'react';

export const Explorer = observer((props: any) => {
  const { operations } = useStores();

  useEffect(() => {
    operations.getList();
  }, []);

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          direction="row"
          wrap={true}
          fill={true}
          justify="between"
          align="start"
        >
          {operations.list.map(o => (
            <Box key={o.id} direction="row">
              <Text>{o.id}</Text>
              <Text>{o.ethAddress}</Text>
              <Text>{o.oneAddress}</Text>
              <Text>{o.type}</Text>
              <Text>{o.status}</Text>
            </Box>
          ))}
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});
