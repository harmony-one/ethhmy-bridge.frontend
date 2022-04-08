import React from 'react';
import { Icon, Text } from '../../../../components/Base';
import { Box } from 'grommet/components/Box';
import { Button } from 'grommet/components/Button';
import * as s from './TokenSettingsModal.styl';
import cn from 'classnames';
import { EXCHANGE_STEPS } from '../../../../stores/Exchange';
import { NETWORK_TYPE, TOKEN } from '../../../../stores/interfaces';
import * as styles from '../../../Exchange/styles.styl';
import { NETWORK_BASE_TOKEN, NETWORK_ICON } from '../../../../stores/names';
import { useStores } from '../../../../stores';
import { observer } from 'mobx-react';

interface OptionProps {
  checked?: boolean;
}

const Option: React.FC<OptionProps> = ({ checked = false }) => {
  const buttonClasses = cn(s.optionButton, {
    [s.checked]: checked,
  });
  return (
    <Button fill="horizontal" className={buttonClasses}>
      <Box direction="row" gap="16px" align="center" pad="20px">
        <Box gap="8px">
          <Icon glyph="Harmony" />
          <Icon glyph="Ethereum" />
        </Box>
        <Box direction="column" align="start">
          <Text color="Gray" size="xxsmall" lh="18px">
            ERC20 & HRC20
          </Text>
          <Text color="NWhite" size="xsmall" lh="18px">
            Both Harmony & Ethereum
          </Text>
          <Text color="NWhite" size="xxsmall" lh="18px">
            Tokens
          </Text>
        </Box>
        {checked && (
          <Box margin={{ left: 'auto' }}>
            <Icon color="#01E8A2" glyph="Check" />
          </Box>
        )}
      </Box>
    </Button>
  );
};

interface Props {
  onClose?: () => void;
}

export const TokenSettingsModal: React.FC<Props> = observer(({ onClose }) => {
  const { exchange, routing, user } = useStores();
  return (
    <Box
      className={s.layer}
      direction="column"
      align="center"
      width="408px"
      pad="28px"
      gap="20px"
    >
      <Box>
        <Text color="NGray4" size="medium">
          Displaying Tokens
        </Text>
      </Box>
      {/*<Option checked />*/}
      {/*<Option />*/}
      {/*<Option />*/}

      {exchange.step.id === EXCHANGE_STEPS.BASE && exchange.fullConfig && (
        <Box
          direction="row"
          wrap={true}
          align="center"
          justify="center"
          gap="12px"
        >
          {exchange.config.tokens.includes(TOKEN.BUSD) && (
            <Box
              style={{ width: 140 }}
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.BUSD ? styles.selected : '',
              )}
              onClick={() => {
                exchange.setToken(TOKEN.BUSD);
                routing.push(`/${exchange.token}`);
              }}
            >
              <img className={styles.imgToken} src="/busd.svg" />
              <Text color="inherit">BUSD</Text>
            </Box>
          )}

          {exchange.config.tokens.includes(TOKEN.LINK) && (
            <Box
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.LINK ? styles.selected : '',
              )}
              onClick={() => {
                exchange.setToken(TOKEN.LINK);
                routing.push(`/${exchange.token}`);
              }}
            >
              <img className={styles.imgToken} src="/link.png" />
              <Text color="inherit">LINK</Text>
            </Box>
          )}

          {exchange.config.tokens.includes(TOKEN.ERC20) && (
            <Box
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.ERC20 ? styles.selected : '',
              )}
              onClick={() => {
                user.resetTokens();

                exchange.setToken(TOKEN.ERC20);
                routing.push(`/${exchange.token}`);
              }}
            >
              <img
                className={styles.imgToken}
                src={NETWORK_ICON[exchange.network]}
              />
              <Text color="inherit">
                {exchange.network === NETWORK_TYPE.ETHEREUM ? 'ERC20' : 'BEP20'}
              </Text>
            </Box>
          )}

          {exchange.network === NETWORK_TYPE.BINANCE &&
            exchange.config.tokens.includes(TOKEN.HRC20) && (
              <Box
                className={cn(
                  styles.itemToken,
                  exchange.token === TOKEN.HRC20 ? styles.selected : '',
                )}
                onClick={() => {
                  user.resetTokens();

                  exchange.setToken(TOKEN.HRC20);
                  routing.push(`/${exchange.token}`);
                }}
              >
                <img className={styles.imgToken} src="/one.svg" />
                <Text color="inherit">HRC20</Text>
              </Box>
            )}

          {exchange.config.tokens.includes(TOKEN.ERC721) && (
            <Box
              style={{ width: 140 }}
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.ERC721 ? styles.selected : '',
              )}
              onClick={() => {
                user.resetTokens();

                exchange.setToken(TOKEN.ERC721);
                routing.push(`/${exchange.token}`);
              }}
            >
              <img className={styles.imgToken} src="/eth.svg" />
              <Text color="inherit">ERC721</Text>
            </Box>
          )}

          {exchange.config.tokens.includes(TOKEN.HRC721) && (
            <Box
              style={{ width: 140 }}
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.HRC721 ? styles.selected : '',
              )}
              onClick={() => {
                user.resetTokens();

                exchange.setToken(TOKEN.HRC721);
                routing.push(`/${exchange.token}`);
              }}
            >
              <img className={styles.imgToken} src="/one.svg" />
              <Text color="inherit">HRC721</Text>
            </Box>
          )}

          {exchange.config.tokens.includes(TOKEN.ERC1155) && (
            <Box
              style={{ width: 140 }}
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.ERC1155 ? styles.selected : '',
              )}
              onClick={() => {
                user.resetTokens();

                exchange.setToken(TOKEN.ERC1155);
                routing.push(`/${exchange.token}`);
              }}
            >
              <img className={styles.imgToken} src="/eth.svg" />
              <Text color="inherit">ERC1155</Text>
            </Box>
          )}

          {exchange.config.tokens.includes(TOKEN.HRC1155) && (
            <Box
              style={{ width: 140 }}
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.HRC1155 ? styles.selected : '',
              )}
              onClick={() => {
                user.resetTokens();

                exchange.setToken(TOKEN.HRC1155);
                routing.push(`/${exchange.token}`);
              }}
            >
              <img className={styles.imgToken} src="/one.svg" />
              <Text color="inherit">HRC1155</Text>
            </Box>
          )}

          {exchange.config.tokens.includes(TOKEN.ETH) && (
            <Box
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.ETH ? styles.selected : '',
              )}
              onClick={() => {
                routing.push(`/${exchange.token}`);
                exchange.setToken(TOKEN.ETH);
              }}
            >
              <img
                className={styles.imgToken}
                src={NETWORK_ICON[exchange.network]}
              />
              <Text color="inherit">
                {NETWORK_BASE_TOKEN[exchange.network]}
              </Text>
            </Box>
          )}

          {exchange.config.tokens.includes(TOKEN.ONE) && (
            <Box
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.ONE ? styles.selected : '',
              )}
              onClick={() => {
                exchange.setToken(TOKEN.ONE);
                routing.push(`/${exchange.token}`);

                // user.setHRC20Mapping(process.env.ONE_HRC20, true);

                // user.setHRC20Token(process.env.ONE_HRC20);
                // userMetamask.setTokenDetails({
                //   name: 'Ethereum ONE',
                //   decimals: '18',
                //   erc20Address: '',
                //   symbol: 'ONE',
                // });
              }}
            >
              <img className={styles.imgToken} src="/one.svg" />
              <Text color="inherit">ONE</Text>
            </Box>
          )}
        </Box>
      )}

      <Button onClick={onClose} fill="horizontal" label="Close" />
    </Box>
  );
});

TokenSettingsModal.displayName = 'TokenSettingsModal';
