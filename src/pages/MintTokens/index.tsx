import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { ItemToken, Spinner } from 'ui';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Text, TextInput, Title } from 'components/Base';
import { TOKEN } from 'stores/interfaces';
import { useStores } from 'stores';
import { statusFetching } from '../../constants';
import * as styles from '../Exchange/styles.styl';
import * as services from 'services';

export const MintTokens = observer((props: any) => {
  const { userMetamask } = useStores();
  const [status, setStatus] = useState<statusFetching>('init');
  const [error, setError] = useState('');
  const [token, setToken] = useState<TOKEN>(TOKEN.BUSD);
  const [address, setAddress] = useState<string>('');

  const isPending = status === 'fetching';

  useEffect(() => {
    setAddress(userMetamask.ethAddress);
  }, [userMetamask.ethAddress]);

  let icon = () => <Icon style={{ width: 50 }} glyph="RightArrow" />;
  let description = '';

  switch (status) {
    case 'fetching':
      icon = () => <Spinner />;
      description = 'Operation in progress';
      break;

    case 'error':
      icon = () => <Icon size="50" style={{ width: 50 }} glyph="Alert" />;
      description = error;
      break;

    case 'success':
      icon = () => <Icon size="50" style={{ width: 50 }} glyph="CheckMark" />;
      description = 'Success';
      break;
  }

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          wrap={true}
          fill={true}
          justify="center"
          align="center"
          margin={{ top: 'xlarge' }}
        >
          <Box
            direction="column"
            pad="xlarge"
            justify="center"
            align="center"
            gap="30px"
            background="white"
            style={{ width: 600, borderRadius: 15 }}
          >
            <Box direction="row">
              <ItemToken
                onClick={setToken}
                tokenType={TOKEN.BUSD}
                selected={token === TOKEN.BUSD}
              />
              <ItemToken
                onClick={setToken}
                tokenType={TOKEN.LINK}
                selected={token === TOKEN.LINK}
              />
            </Box>
            <Title size="medium">
              Get 100 {token.toUpperCase()} tokens to your address
            </Title>

            {status !== 'init' ? (
              <Box
                direction="column"
                align="center"
                justify="center"
                fill={true}
                pad="medium"
                style={{ background: '#dedede40' }}
              >
                {icon()}
                <Box className={styles.description} margin={{ top: 'medium' }}>
                  <Text>{description}</Text>
                  {/*{exchange.txHash ? (*/}
                  {/*  <a*/}
                  {/*    style={{ marginTop: 10 }}*/}
                  {/*    href={EXPLORER_URL + `/tx/${exchange.txHash}`}*/}
                  {/*    target="_blank"*/}
                  {/*  >*/}
                  {/*    Tx id: {truncateAddressString(exchange.txHash)}*/}
                  {/*  </a>*/}
                  {/*) : null}*/}
                </Box>
              </Box>
            ) : null}

            <TextInput
              disabled={isPending}
              style={{ width: 400 }}
              value={address}
              onChange={setAddress}
            />
            <Button
              onClick={() => {
                setStatus('fetching');
                setError('');

                services
                  .mintTokens({ address, token })
                  .then(res => {
                    if (res.status === 'success') {
                      setStatus('success');
                    } else {
                      throw new Error(res.error);
                    }
                  })
                  .catch(e => {
                    if (e.status && e.response.body) {
                      setError(e.response.body.message);
                    } else {
                      setError(e.message);
                    }

                    setStatus('error');
                  });
              }}
              disabled={isPending}
            >
              Get {token.toUpperCase()} tokens
            </Button>
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});
