import React from 'react';
import { Box } from 'grommet';
import { Title } from 'components/Base';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Info } from 'components/Info';

export const InfoPage = () => {
  return (
    <BaseContainer>
      <PageContainer>
        <Box
          className={styles.faqContainer}
          pad={{ horizontal: 'large', top: 'large' }}
        >
          <Box direction="row" justify="center" margin={{ bottom: 'medium' }}>
            <Title
              style={{
                // color: '#47b8eb',
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
              size="large"
            >
              {'Ethereum <> Harmony Bridge'}
            </Title>
          </Box>
          <Box
            style={{ background: 'white', borderRadius: 5 }}
            pad={{ bottom: 'medium' }}
          >
            <Info title="" />
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
};
