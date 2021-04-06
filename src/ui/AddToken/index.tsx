import { Box } from 'grommet';
import { Icon } from '../../components/Base/components/Icons';
import { Button, Text } from '../../components/Base';
import * as React from 'react';
import { NETWORK_TYPE } from '../../stores/interfaces';
import * as styles from './add-token.styl';
import ReactTooltip from 'react-tooltip';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { useEffect } from 'react';

export const AddTokenIcon = (data: {
  hrc20Address: string;
  symbol: string;
  decimals: string;
  image?: string;
  network: NETWORK_TYPE;
}) => (
  <Box
    className={styles.addToken}
    onClick={() => {
      // const provider = window.web3.currentProvider;
      // @ts-ignore
      window.ethereum.request(
        {
          // method: 'metamask_watchAsset',
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: data.hrc20Address,
              symbol: data.symbol.slice(0, 6),
              decimals: data.decimals,
              image: data.image || '',
            },
          },
          // id: Math.round(Math.random() * 100000),
        },
        (err, added) => {
          console.log('provider returned', err, added);

          if (err || 'error' in added) {
            console.log(err, added.err);

            return;
          }

          console.log('success');
        },
      );
    }}
  >
    <a data-tip={`Add ${data.symbol} to Harmony Metamask`}>
      <Icon size="12px" glyph="Plus" />
    </a>
    <ReactTooltip place="top" type="dark" effect="solid" />
  </Box>
);

export const AddTokenString = observer(
  (data: {
    hrc20Address: string;
    symbol: string;
    decimals: string;
    image?: string;
    network: NETWORK_TYPE;
    position?: any;
  }) => {
    const { user, actionModals } = useStores();

    if (user.isAuthorized && !user.isMetamask) {
      return null;
    }

    return (
      <Box
        className={styles.addTokenString}
        direction="row"
        justify={'end'}
        align="start"
      >
        <Button
          bgColor="#00ADE8"
          // style={{ width: 180, top: 10 }}
          // transparent={true}
          onClick={() => {
            // const provider = window.web3.currentProvider;
            // @ts-ignore

            if (
              !user.isAuthorized ||
              (user.isMetamask && !user.isNetworkActual)
            ) {
              actionModals.open(() => <AddTokenModal {...data} />, {
                title: '',
                applyText: 'Cancel',
                closeText: '',
                noValidation: true,
                width: '500px',
                showOther: true,
                onApply: () => Promise.resolve(),
              });
            }

            if (user.isMetamask && user.isNetworkActual) {
              // @ts-ignore
              window.ethereum.request(
                {
                  // method: 'metamask_watchAsset',
                  method: 'wallet_watchAsset',
                  params: {
                    type: 'ERC20',
                    options: {
                      address: data.hrc20Address,
                      symbol: data.symbol.slice(0, 6),
                      decimals: data.decimals,
                      image: data.image || '',
                    },
                  },
                  // id: Math.round(Math.random() * 100000),
                },
                (err, added) => {
                  console.log('provider returned', err, added);

                  if (err || 'error' in added) {
                    console.log(err, added.err);

                    return;
                  }

                  console.log('success');
                },
              );
            }
          }}
        >
          <Box margin={{ right: '4px' }}>
            <Icon glyph="Plus" size="12px" />
          </Box>
          <Text color="white" size="small">
            Add bridged <span className={styles.link}>{data.symbol}</span> to{' '}
            <span className={styles.link}>Metamask</span>
          </Text>
        </Button>
      </Box>
    );
  },
);

export const AddTokenModal = observer(
  (data: {
    hrc20Address: string;
    symbol: string;
    decimals: string;
    image?: string;
    network: NETWORK_TYPE;
    position?: any;
  }) => {
    const { user, actionModals } = useStores();

    useEffect(() => {
      if (user.isAuthorized && user.isMetamask && user.isNetworkActual) {
        actionModals.closeLastModal();

        // setTimeout(() => {
        //   // @ts-ignore
        //   window.ethereum.request(
        //     {
        //       // method: 'metamask_watchAsset',
        //       method: 'wallet_watchAsset',
        //       params: {
        //         type: 'ERC20',
        //         options: {
        //           address: data.hrc20Address,
        //           symbol: data.symbol.slice(0, 6),
        //           decimals: data.decimals,
        //           image: data.image || '',
        //         },
        //       },
        //       // id: Math.round(Math.random() * 100000),
        //     },
        //     (err, added) => {
        //       console.log('provider returned', err, added);
        //
        //       if (err || 'error' in added) {
        //         console.log(err, added.err);
        //
        //         return;
        //       }
        //
        //       console.log('success');
        //     },
        //   );
        // }, 1000);
      }
    }, [user.isMetamask, user.isAuthorized, user.isNetworkActual]);

    return (
      <Box pad="large">
        <Text size="large">
          To add a bridged token to Metamask, you need to switch Metamask
          network to Harmony {process.env.NETWORK} and try again.
        </Text>
      </Box>
    );
  },
);
