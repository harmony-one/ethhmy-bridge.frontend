import React, { useState } from 'react';
import { Box } from 'grommet';
import { Title, Text, Button } from 'components/Base';
import * as styles from './faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Icon } from 'components/Base/components/Icons';
import { useStores } from 'stores';
import { faqConfig } from './Config';

export const HelpPage = () => {
  const { actionModals } = useStores();

  const [expandedIdxs, setExpandedIdxs] = useState([]);

  const addExpanded = idx => setExpandedIdxs(expandedIdxs.concat(idx));
  const removeExpanded = idx =>
    setExpandedIdxs(expandedIdxs.filter(item => item !== idx));

  return (
    <BaseContainer>
      <PageContainer>
        <Box className={styles.faqContainer}>
          <Box direction="row" justify="center" margin={{ bottom: 'medium' }}>
            <Title
              style={{
                // color: '#47b8eb',
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
              size="large"
            >
              Need Help
            </Title>
          </Box>
          <Box
            style={{ background: 'white', borderRadius: 5 }}
            pad={{ vertical: 'large', horizontal: 'large' }}
          >
            {faqConfig.map((item, idx) => {
              const isExpanded = expandedIdxs.includes(idx);

              return (
                <Box
                  className={styles.item}
                  direction="column"
                  key={String(idx)}
                  style={{ 
                    borderBottom: isExpanded ? '1px #dedede solid': 'none'
                  }}
                  onClick={() =>
                    isExpanded ? removeExpanded(idx) : addExpanded(idx)
                  }
                >
                  <Box className={styles.label} direction="row" align="center">
                    <Box className={styles.labelIcon}>
                      {isExpanded ? '-' : '+'}
                    </Box>
                    {/*<Icon*/}
                    {/*  styles={{ marginBottom: 2 }}*/}
                    {/*  glyph={isExpanded ? 'Minus' : 'Plus'}*/}
                    {/*/>*/}
                    <Text
                      className={styles.labelText}
                      size="large"
                      style={{ marginLeft: 10 }}
                      bold
                    >
                      {item.label}
                    </Text>
                  </Box>
                  {isExpanded ? (
                    <Box className={styles.textContainer}>
                      <ul>
                        <li>
                          <Text size="medium" className={styles.text}>
                            {item.text()}
                          </Text>
                        </li>
                      </ul>
                      <br/>
                      {item.details ?
                        <Box direction="row" pad={{  bottom: 'small' }} justify="end">
                          <Button onClick={() => {
                            actionModals.open(
                              () => (
                                <Box 
                                  pad="medium" 
                                  wrap={true}
                                  direction="row" 
                                  style={{ maxWidth: '100vw' 
                                }}>
                                  <Box pad={{ horizontal: 'medium' }} direction="column" style={{ width: '550px' }}>
                                    <Text size="medium" className={styles.text}>
                                      {item.details()}
                                    </Text>
                                  </Box>
                                  <Box>
                                    {item.iframeUrl && (
                                      <iframe
                                        sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
                                        width="550px"
                                        height="800px"
                                        style={{ border: 0, overflow: 'auto' }}
                                        src={item.iframeUrl}
                                      >
                                        Your browser does not allow embedded content.
                                      </iframe>
                                    )}
                                  </Box>
                                </Box>
                              ),
                              {
                                title: '',
                                applyText: 'Close',
                                closeText: '',
                                noValidation: true,
                                width: '1200px',
                                showOther: true,
                                onApply: () => {
                                  return Promise.resolve();
                                },
                              },
                            )      
                          }}>Read more and write to support</Button>
                        </Box> : 
                        null
                      }
                      <hr/>
                    </Box>
                  ) : null}
                </Box>
              );
            })}
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
};
