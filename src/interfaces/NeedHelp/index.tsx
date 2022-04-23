import React, { useState } from 'react';
import { Box } from 'grommet';
import { Title, Text } from 'components/Base';
import * as styles from './faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Icon } from 'components/Base/components/Icons';
import { faqConfig } from './helpConfig';
import { LayoutCommon } from '../../components/Layouts/LayoutCommon/LayoutCommon';

export const HelpPage = () => {
  const [expandedIdxs, setExpandedIdxs] = useState([]);

  const addExpanded = idx => setExpandedIdxs(expandedIdxs.concat([idx]));
  const removeExpanded = idx =>
    setExpandedIdxs(expandedIdxs.filter(item => item !== idx));

  return (
    <LayoutCommon>
      <Box className={styles.faqContainer} fill="horizontal">
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
        <Box className={styles.content} pad="xlarge">
          {faqConfig.map((item, idx) => {
            const isExpanded = expandedIdxs.includes(idx);

            return (
              <Box
                className={styles.item}
                direction="column"
                key={String(idx)}
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
                  </Box>
                ) : null}
              </Box>
            );
          })}
        </Box>
      </Box>
    </LayoutCommon>
  );
};
