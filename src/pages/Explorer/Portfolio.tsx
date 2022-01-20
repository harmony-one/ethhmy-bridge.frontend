import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Table } from 'components/Table';
import { getColumns, StatisticBlockLight } from './Common';
import { ExpandedRow } from './ExpandedRow';
import { Checkbox } from '../../components/Base/components/Inputs/types';
import { validators } from '../../services';
import { Title } from '../../components/Base/components/Title';
import { PaginationType } from '../../components/Table/CustomPagination';

export const Portfolio = observer((props: any) => {
  const { portfolio, user, tokens, userMetamask } = useStores();
  const validator = props.match.params.validator || 0;

  const ethAddress = '0x58ae106686c5f55a4de9a30fc26dfdad7bef8c42';
  const oneAddress = '0x58ae106686c5f55a4de9a30fc26dfdad7bef8c42';

  useEffect(() => {
    tokens.init();
    tokens.fetch();
    portfolio.loadOperationList(ethAddress, oneAddress);
  }, []);

  const isAuthorized = userMetamask.ethAddress || user.address;

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          direction="column"
          wrap={true}
          fill={true}
          justify="center"
          align="start"
          margin={{ top: 'xlarge' }}
        >
          <Box pad="small">
            <Box>erc20</Box>
            {Object.entries(portfolio.tokens.erc20).map(
              ([address, balance]) => {
                return (
                  <Box>
                    {address} - {balance}
                  </Box>
                );
              },
            )}
          </Box>
          <Box pad="small">
            <Box>hrc20</Box>
            {Object.entries(portfolio.tokens.hrc20).map(
              ([address, balance]) => {
                return (
                  <Box>
                    {address} - {balance}
                  </Box>
                );
              },
            )}
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});
