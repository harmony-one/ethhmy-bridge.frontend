import React from 'react';
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Container } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

const flexRowSpace = <span style={{ flex: 1 }}></span>;
const downArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#00ADE8"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

export const SwapPage = () => {
  return (
    <BaseContainer>
      <PageContainer>
        <Box
          className={styles.faqContainer}
          pad={{ horizontal: 'large', top: 'large' }}
          style={{ alignItems: 'center' }}
        >
          <Box
            style={{
              maxWidth: 420,
            }}
            pad={{ bottom: 'medium' }}
          >
            <Container
              style={{
                borderRadius: '30px',
                backgroundColor: 'white',
                padding: '2rem',
                boxShadow:
                  'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',
              }}
            >
              <Container
                style={{
                  padding: '1rem',
                  borderRadius: '20px',
                  border: '1px solid rgb(247, 248, 250)',
                  backgroundColor: 'white',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: 'rgb(86, 90, 105)',
                  }}
                >
                  <span>From</span>
                  {flexRowSpace}
                  <span>Balance: 0</span>
                </div>
              </Container>
              <div
                style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'row',
                  alignContent: 'center',
                }}
              >
                {flexRowSpace}
                {downArrow}
                {flexRowSpace}
              </div>
              <Container
                style={{
                  padding: '1rem',
                  borderRadius: '20px',
                  border: '1px solid rgb(247, 248, 250)',
                  backgroundColor: 'white',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <span>To</span>
                  {flexRowSpace}
                  <span>Balance: 0</span>
                </div>
              </Container>
            </Container>
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
};
