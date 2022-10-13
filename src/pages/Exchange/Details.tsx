import * as React from 'react';
import { Box, Image } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Icon, Text } from 'components/Base';
import { useStores } from 'stores';
import { formatWithSixDecimals, truncateAddressString } from 'utils';
import { EXCHANGE_MODE, TOKEN } from '../../stores/interfaces';
import { Price } from '../Explorer/Components';
import { useState } from 'react';
import { SliceTooltip } from '../../ui/SliceTooltip';
import { NETWORK_BASE_TOKEN, NETWORK_NAME } from '../../stores/names';
import { useMediaQuery } from 'react-responsive';
import styled from 'styled-components';
// import { EXPLORER_URL } from '../../blockchain';

const AssetRow = props => {
  return (
    <Box
      direction="row"
      justify="between"
      margin={{ bottom: 'medium' }}
      align="start"
    >
      <Box>
        <Text color="NWhite" size="small" bold={true}>
          <SliceTooltip value={props.label} maxLength={24} />
          {props.showIds ? 'Token IDs' : ''}
        </Text>
      </Box>
      <Box direction="row" align="center">
        {props.address ? (
          <a href={props.link}>
            <Text
              size="small"
              style={{
                fontFamily: 'monospace',
                cursor: 'pointer',
                // textDecoration: 'underline',
              }}
            >
              {props.value}
            </Text>
          </a>
        ) : (
          <>
            {props.value ? <Text size="small">{props.value}</Text> : null}
            {props.children}
          </>
        )}

        {props.after && (
          <Text style={{ marginLeft: 5 }} color="Basic500">
            {props.after}
          </Text>
        )}
        {props.address && (
          <Icon
            glyph="PrintFormCopy"
            size="20px"
            color="NBlue"
            style={{ marginLeft: 10, width: 20 }}
          />
        )}
      </Box>
    </Box>
  );
};

const LiquidityWarning = styled(Box)`
  background-color: #e65454;
  padding: 12px;
  color: #ebf3f9;
  border-radius: 7px;
  text-align: center;
`;

// const DataItem = (props: {
//   text: any;
//   label: string;
//   icon: string;
//   iconSize: string;
//   color?: string;
//   link?: string;
// }) => {
//   return (
//     <Box direction="row" justify="between" gap="10px">
//       <Box direction="row" justify="start" align="center" gap="5px">
//         <Icon
//           glyph={props.icon}
//           size={props.iconSize}
//           color={props.color || '#1c2a5e'}
//           style={{ marginBottom: 2, width: 20 }}
//         />
//         <Text color="#1c2a5e" size={'small'}>
//           {props.label}
//         </Text>
//       </Box>
//       {props.link ? (
//         <a
//           href={props.link}
//           target="_blank"
//           style={{ color: props.color || '#1c2a5e' }}
//         >
//           <Text color={props.color || '#1c2a5e'} size={'small'} bold={true}>
//             {props.text}
//           </Text>
//         </a>
//       ) : (
//         <Text color={props.color || '#1c2a5e'} size={'small'} bold={true}>
//           {props.text}
//         </Text>
//       )}
//     </Box>
//   );
// };

export const Details = observer<{ showTotal?: boolean; children?: any }>(
  ({ showTotal, children }) => {
    const { exchange, tokens, userMetamask } = useStores();
    const [isShowDetail, setShowDetails] = useState(false);
    const isMobile = useMediaQuery({ query: '(max-width: 600px)' });

    const isETH = exchange.mode === EXCHANGE_MODE.ETH_TO_ONE;

    const getAmount = () => {
      switch (exchange.token) {
        case TOKEN.ERC20:
          return (
            <AssetRow
              label={`${String(
                userMetamask.erc20TokenDetails &&
                  userMetamask.erc20TokenDetails.symbol,
              ).toUpperCase()} amount`}
              value={formatWithSixDecimals(
                exchange.transaction.amount.toString(),
              )}
            />
          );

        case TOKEN.HRC721:
        case TOKEN.ERC721:
          return (
            <>
              {Array.isArray(exchange.transaction.amount)
                ? exchange.transaction.amount.map((amount, idx) => (
                    <AssetRow
                      key={idx}
                      showIds={true}
                      label={`${String(
                        userMetamask.erc20TokenDetails &&
                          userMetamask.erc20TokenDetails.symbol,
                      ).toUpperCase()} token ID`}
                      value={amount}
                    />
                  ))
                : null}
            </>
          );

        case TOKEN.ETH:
          return (
            <AssetRow
              label={`${NETWORK_BASE_TOKEN[exchange.network]} amount`}
              value={formatWithSixDecimals(
                exchange.transaction.amount.toString(),
              )}
            />
          );

        default:
          return (
            <AssetRow
              label={`${String(exchange.token).toUpperCase()} amount`}
              value={formatWithSixDecimals(
                exchange.transaction.amount.toString(),
              )}
            />
          );
      }
    };

    const getImage = () => {
      if (exchange.transaction.nftImageUrl !== '') {
        return (
          <Box margin={{ bottom: '20px' }} align="center">
            <Box width="small" direction="row" margin={{ bottom: '5px' }}>
              <Image fit="cover" src={exchange.transaction.nftImageUrl} />
            </Box>
            <Box direction="row">
              <Text size="small" bold={true}>
                {exchange.transaction.nftName}
              </Text>
            </Box>
          </Box>
        );
      }
      return '';
    };

    const hasLiquidity = tokens.hasLiquidity(exchange.transaction.erc20Address);

    return (
      <Box direction="column">
        <AssetRow
          label={`${NETWORK_BASE_TOKEN[exchange.network]} address`}
          value={truncateAddressString(
            exchange.transaction.ethAddress,
            isMobile ? 7 : 12,
          )}
          address={true}
        />
        <AssetRow
          label="ONE address"
          value={truncateAddressString(
            exchange.transaction.oneAddress,
            isMobile ? 7 : 12,
          )}
          address={true}
        />
        {getAmount()}

        {getImage()}

        {/*{exchange.mode === EXCHANGE_MODE.ONE_TO_ETH ? (*/}
        {/*  <AssetRow label="Deposit amount" value="">*/}
        {/*    {!exchange.isDepositAmountLoading ? (*/}
        {/*      <Price*/}
        {/*        value={Number(exchange.depositAmount.toFixed(2))}*/}
        {/*        isEth={false}*/}
        {/*        boxProps={{ pad: {} }}*/}
        {/*      />*/}
        {/*    ) : (*/}
        {/*      <Text>...loading</Text>*/}
        {/*    )}*/}
        {/*  </AssetRow>*/}
        {/*) : null}*/}

        {/*<DataItem*/}
        {/*  icon="User"*/}
        {/*  iconSize="16px"*/}
        {/*  text={truncateAddressString(exchange.transaction.oneAddress)}*/}
        {/*  label="ONE address:"*/}
        {/*  link={EXPLORER_URL + `/address/${exchange.transaction.oneAddress}`}*/}
        {/*/>*/}

        {children ? <Box direction="column">{children}</Box> : null}

        {/*{!hasLiquidity ? (*/}
        {/*  <Box pad="small">*/}
        {/*    <LiquidityWarning>*/}
        {/*      Caution: This token doesn't have liquidity*/}
        {/*    </LiquidityWarning>*/}
        {/*  </Box>*/}
        {/*) : null}*/}

        {showTotal ? (
          <Box
            direction="column"
            pad={{ top: 'small' }}
            style={{ borderTop: '1px solid #dedede' }}
          >
            <AssetRow label="Network Fee (total)" value="">
              {!exchange.isFeeLoading ? (
                <Price
                  value={exchange.networkFee}
                  isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_ONE}
                  boxProps={{ pad: {} }}
                  network={exchange.network}
                />
              ) : (
                <Text>...loading</Text>
              )}
            </AssetRow>

            {!isShowDetail && !exchange.isFeeLoading ? (
              <Box
                direction="row"
                justify="end"
                margin={{ top: '-10px' }}
                onClick={() => setShowDetails(true)}
              >
                <Icon
                  size="14px"
                  glyph="ArrowDown"
                  style={{ marginRight: 10 }}
                />
                <Text size="small">Show more details</Text>
              </Box>
            ) : null}

            {!exchange.isFeeLoading &&
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH &&
            isShowDetail ? (
              <div style={{ opacity: 1 }}>
                <AssetRow label="Approve" value="">
                  <Price
                    value={0.0067219}
                    isEth={false}
                    boxProps={{ pad: {} }}
                    network={exchange.network}
                  />
                </AssetRow>
                {exchange.token === TOKEN.HRC721 ? (
                  <AssetRow label="Lock Token" value="">
                    <Price
                      value={0.0067219}
                      isEth={false}
                      boxProps={{ pad: {} }}
                      network={exchange.network}
                    />
                  </AssetRow>
                ) : (
                  <AssetRow label="Burn" value="">
                    <Price
                      value={0.0067219}
                      isEth={false}
                      boxProps={{ pad: {} }}
                      network={exchange.network}
                    />
                  </AssetRow>
                )}
                <AssetRow
                  label={NETWORK_NAME[exchange.network] + ' gas'}
                  value=""
                >
                  <Price
                    value={Number(exchange.depositAmount.toFixed(2))}
                    isEth={false}
                    boxProps={{ pad: {} }}
                    network={exchange.network}
                  />
                </AssetRow>
              </div>
            ) : null}

            {!exchange.isFeeLoading &&
            exchange.mode === EXCHANGE_MODE.ETH_TO_ONE &&
            isShowDetail ? (
              <div style={{ opacity: 1 }}>
                <AssetRow label="Approve (~50000 gas)" value="">
                  <Price
                    value={exchange.networkFee / 2}
                    isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_ONE}
                    boxProps={{ pad: {} }}
                    network={exchange.network}
                  />
                </AssetRow>
                {exchange.token === TOKEN.HRC721 ? (
                  <AssetRow label="Burn token (~50000 gas)" value="">
                    <Price
                      value={exchange.networkFee / 2}
                      isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_ONE}
                      boxProps={{ pad: {} }}
                      network={exchange.network}
                    />
                  </AssetRow>
                ) : (
                  <AssetRow label="Lock token (~50000 gas)" value="">
                    <Price
                      value={exchange.networkFee / 2}
                      isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_ONE}
                      boxProps={{ pad: {} }}
                      network={exchange.network}
                    />
                  </AssetRow>
                )}
              </div>
            ) : null}

            {isShowDetail ? (
              <Box
                direction="row"
                justify="end"
                onClick={() => setShowDetails(false)}
              >
                <Icon size="14px" glyph="ArrowUp" style={{ marginRight: 10 }} />
                <Text size="small">Hide details</Text>
              </Box>
            ) : null}

            {/*<AssetRow*/}
            {/*  label="Total"*/}
            {/*  value={formatWithSixDecimals(*/}
            {/*    Number(exchange.transaction.amount) + exchange.networkFee,*/}
            {/*  )}*/}
            {/*/>*/}
          </Box>
        ) : null}

        {exchange.txHash ? (
          <Box direction="column" margin={{ top: 'large' }}>
            <AssetRow
              label="Transaction hash"
              value={truncateAddressString(exchange.txHash, isMobile ? 7 : 12)}
              address={true}
            />
          </Box>
        ) : null}
      </Box>
    );
  },
);

Details.displayName = 'Details';

export const TokenDetails = observer<{ showTotal?: boolean; children?: any }>(
  ({ showTotal, children }) => {
    const { userMetamask, exchange, user } = useStores();

    if (!userMetamask.erc20TokenDetails) {
      return null;
    }

    if (exchange.mode === EXCHANGE_MODE.ONE_TO_ETH && !user.hrc20Address) {
      return <Text color="red">Token not found</Text>;
    }

    return (
      <Box direction="column">
        <AssetRow
          label="Token name"
          value={userMetamask.erc20TokenDetails.name}
        />
        <AssetRow
          label="Token Symbol"
          value={userMetamask.erc20TokenDetails.symbol}
        />
        {exchange.mode === EXCHANGE_MODE.ETH_TO_ONE &&
        userMetamask.ethAddress ? (
          <AssetRow
            label="User Ethereum Balance"
            value={formatWithSixDecimals(userMetamask.erc20Balance)}
          />
        ) : null}

        {exchange.mode === EXCHANGE_MODE.ONE_TO_ETH && user.address ? (
          <AssetRow
            label="User Harmony Balance"
            value={formatWithSixDecimals(user.hrc20Balance)}
          />
        ) : null}
      </Box>
    );
  },
);

TokenDetails.displayName = 'TokenDetails';
