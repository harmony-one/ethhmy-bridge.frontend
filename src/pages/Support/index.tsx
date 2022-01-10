import React, { useState } from 'react';
import { Box } from 'grommet';
import { Title, Text, Select } from 'components/Base';
import * as styles from './faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { Icon } from 'components/Base/components/Icons';
import { TOKEN } from '../../stores/interfaces';

const formsConfig = [
  {
    label: 'Error in the end',
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=0ea68569-a126-4cce-8b6f-7ec9a6ee4759',
  },
  {
    label: 'Wrapped token',
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=1430901b-62e2-4eea-a44e-7a60c960eb57',
  },
  {
    label: 'Funds are locked',
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=6a7c3bd6-cf1e-4b4f-b91f-1133b68e2fc3',
  },
  {
    label: 'Deposit withdrawal',
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=6d9caa8e-2f02-4d20-9503-687ed3cdfab2',
  },
  {
    label: 'Operation success, no tokens',
    iframeUrl:
      'https://forms.helpdesk.com?licenseID=1447433401&contactFormID=fb4de9c6-8f00-4e3b-b2e1-6df5763ff03b',
  },
];

export const SupportPage = () => {
  const [questionId, setQuestionId] = useState(-1);

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
              Contact the Support
            </Title>
          </Box>
          <Box
            style={{ background: 'white', borderRadius: 5 }}
            pad={{ vertical: 'large', horizontal: 'large' }}
          >
            <Text>Please select your error type:</Text>
            <Box margin={{ top: 'xsmall', bottom: 'large' }}>
              <Select
                size="full"
                options={formsConfig.map((f, idx) => ({
                  text: f.label,
                  value: idx,
                }))}
                // onChange={v => setTimeout(() => setQuestionId(v), 300)}
                onChange={setQuestionId}
              />
            </Box>
            <Box>
              {formsConfig[questionId] && (
                <iframe
                  sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
                  width="100%"
                  height="800px"
                  style={{ border: 0, overflow: 'auto' }}
                  src={formsConfig[questionId].iframeUrl}
                >
                  Your browser does not allow embedded content.
                </iframe>
              )}
            </Box>
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
};
