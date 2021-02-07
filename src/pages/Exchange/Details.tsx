import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Icon, Text } from 'components/Base';
import { useStores } from 'stores';
import { formatWithSixDecimals, truncateAddressString } from 'utils';
import { EXCHANGE_MODE, TOKEN } from '../../stores/interfaces';
import { Price } from '../Explorer/Components';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Loader from 'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';

const AssetRow = props => {
  return (
    <Box
      direction="row"
      justify="between"
      margin={{ bottom: 'medium' }}
      align="start"
    >
      <Box>
        <Text size="small" bold={true}>
          {props.label}
        </Text>
      </Box>
      <Box direction="row" align="center">
        {props.address ? (
          <a href={props.link}>
            <Text
              size="small"
              style={{
                fontFamily: 'monospace',
              }}
            >
              {props.address ? truncateAddressString(props.value) : props.value}
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
          <CopyToClipboard text={props.value}>
            <Icon
              glyph="PrintFormCopy"
              size="1em"
              color="#1c2a5e"
              style={{ marginLeft: 10, width: 20 }}
            />
          </CopyToClipboard>
        )}
      </Box>
    </Box>
  );
};

export const Details = observer<{ showTotal?: boolean; children?: any }>(
  ({ showTotal, children }) => {
    const { exchange, userMetamask } = useStores();
    const [isShowDetail, setShowDetails] = useState(false);

    const isETH = exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT;

    return (
      <Box direction="column">
        <AssetRow
          label="ETH Address"
          value={exchange.transaction.ethAddress}
          address={true}
        />
        <AssetRow
          label="Secret Address"
          value={exchange.transaction.scrtAddress}
          address={true}
        />
        {exchange.token === TOKEN.ERC20 ? (
          <AssetRow
            label={`${String(
              userMetamask.erc20TokenDetails &&
                userMetamask.erc20TokenDetails.symbol,
            ).toUpperCase()} amount`}
            value={formatWithSixDecimals(exchange.transaction.amount)}
          />
        ) : (
          <AssetRow
            label={`${String(exchange.token).toUpperCase()} amount`}
            value={formatWithSixDecimals(exchange.transaction.amount)}
          />
        )}

        {/*<DataItem*/}
        {/*  icon="User"*/}
        {/*  iconSize="16px"*/}
        {/*  text={truncateAddressString(exchange.transaction.oneAddress)}*/}
        {/*  label="ONE address:"*/}
        {/*  link={EXPLORER_URL + `/address/${exchange.transaction.oneAddress}`}*/}
        {/*/>*/}

        {children ? <Box direction="column">{children}</Box> : null}

        {showTotal ? (
          <Box
            direction="column"
            pad={{ top: 'small' }}
            margin={{ top: 'small' }}
            style={{ borderTop: '1px solid #dedede' }}
          >
            <AssetRow label="Network Fee (total)" value="">
              {!exchange.isFeeLoading ? (
                <Price
                  value={exchange.networkFee}
                  isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT}
                  boxProps={{ pad: {} }}
                />
              ) : (
                <Loader
                  type="ThreeDots"
                  color="#00BFFF"
                  height="1em"
                  width="1em"
                />
              )}
            </AssetRow>
            {exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH ? (
              <AssetRow label="Swap Fee (estimated)" value="">
                {!exchange.isFeeLoading ? (
                  <Price
                    value={exchange.swapFee}
                    valueUsd={exchange.swapFeeUSD}
                    token={userMetamask.erc20TokenDetails?.symbol || 'ETH'}
                    boxProps={{ pad: {} }}
                  />
                ) : (
                  <Loader
                    type="ThreeDots"
                    color="#00BFFF"
                    height="1em"
                    width="1em"
                  />
                )}
              </AssetRow>
            ) : null}
            {!isShowDetail && isETH && !exchange.isFeeLoading ? (
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
            exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT &&
            isShowDetail ? (
              <div style={{ opacity: 1 }}>
                {exchange.token !== TOKEN.ETH ? (
                  <AssetRow label="Approve (~50000 gas)" value="">
                    <Price
                      value={exchange.networkFee / 2}
                      isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT}
                      boxProps={{ pad: {} }}
                    />
                  </AssetRow>
                ) : null}
                <AssetRow label="Lock token (~50000 gas)" value="">
                  <Price
                    value={
                      exchange.token === TOKEN.ETH
                        ? exchange.networkFee
                        : exchange.networkFee / 2
                    }
                    isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT}
                    boxProps={{ pad: {} }}
                  />
                </AssetRow>
              </div>
            ) : null}

            {isShowDetail && isETH ? (
              <Box
                direction="row"
                justify="end"
                onClick={() => setShowDetails(false)}
              >
                <Icon size="14px" glyph="ArrowUp" style={{ marginRight: 10 }} />
                <Text size="small">Hide details</Text>
              </Box>
            ) : null}
          </Box>
        ) : null}

        {exchange.txHash ? (
          <Box direction="column" margin={{ top: 'large' }}>
            <a
              href={`${process.env.ETH_EXPLORER_URL}/tx/${exchange.txHash}`}
              style={{ textDecoration: 'none' }}
              target="_blank"
            >
              <AssetRow
                label="Transaction hash"
                value={exchange.txHash}
                address={true}
              />
            </a>
          </Box>
        ) : null}
      </Box>
    );
  },
);

export const TokenDetails = observer<{ showTotal?: boolean; children?: any }>(
  ({ showTotal, children }) => {
    const { userMetamask, exchange, user } = useStores();

    if (!userMetamask.erc20TokenDetails) {
      return null;
    }

    if (exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH && !user.snip20Address) {
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
        {exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT &&
        userMetamask.ethAddress ? (
          <AssetRow
            label="User Ethereum Balance"
            value={formatWithSixDecimals(userMetamask.erc20Balance)}
          />
        ) : null}

        {exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH && user.address ? (
          <AssetRow
            label="User Harmony Balance"
            value={formatWithSixDecimals(user.snip20Balance)}
          />
        ) : null}
      </Box>
    );
  },
);
