import React, { useContext } from 'react';
import { Icon, Text } from '../../../../components/Base';
import { Box } from 'grommet/components/Box';
import { Button } from 'grommet/components/Button';
import * as s from './TokenSettingsModal.styl';
import cn from 'classnames';
import { EXCHANGE_STEPS } from '../../../../stores/Exchange';
import { NETWORK_TYPE, TOKEN } from '../../../../stores/interfaces';
import {
  NETWORK_BASE_TOKEN,
  NETWORK_ICON,
  NETWORK_NAME,
} from '../../../../stores/names';
import { useStores } from '../../../../stores';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { ThemeContext } from '../../../../themes/ThemeContext';

interface OptionProps {
  checked?: boolean;
  label: string;
  description: string;
  help: string;
  onClick: () => void;
  icon: React.ReactNode;
}

const Option: React.FC<OptionProps> = ({
  icon,
  label,
  description,
  help,
  checked = false,
  onClick,
}) => {
  const themeContext = useContext(ThemeContext);

  const buttonClasses = cn(s.optionButton, {
    [s.checkedDark]: checked && themeContext.isDark(),
    [s.checkedLight]: checked && !themeContext.isDark(),
  });
  return (
    <Button fill="horizontal" className={buttonClasses} onClick={onClick}>
      <Box direction="row" gap="16px" align="center" pad="20px">
        <Box gap="8px">
          {/*<Icon glyph="Harmony" />*/}
          {/*<Icon glyph="Ethereum" />*/}
          {icon}
        </Box>
        <Box direction="column" align="start">
          <Text color="Gray" size="xxsmall" lh="18px">
            {label}
          </Text>
          <Text size="xsmall" lh="18px">
            {description}
          </Text>
          <Text size="xxsmall" lh="18px">
            {help}
          </Text>
        </Box>
        {/*{checked && (*/}
        {/*  <Box margin={{ left: 'auto' }}>*/}
        {/*    <Icon color="#01E8A2" glyph="Check" />*/}
        {/*  </Box>*/}
        {/*)}*/}
      </Box>
    </Button>
  );
};

const ModalContainer = styled(Box)`
  border: 1px solid ${props => props.theme.modal.borderColor};
  background-color: ${props => props.theme.modal.bgColor};
  border-radius: 10px;
  min-width: 408px;
`;

interface Props {
  onClose?: () => void;
}

export const TokenSettingsModal: React.FC<Props> = observer(({ onClose }) => {
  const { exchange, routing, user } = useStores();
  return (
    <Box direction="column" align="center" fill="vertical" gap="small">
      <Box alignSelf="end">
        <Button onClick={onClose}>
          <Icon glyph="Close" />
        </Button>
      </Box>
      <ModalContainer direction="column" align="center" pad="28px" gap="20px">
        <Box>
          <Text color="NGray4" size="medium">
            Displaying Tokens
          </Text>
        </Box>

        {exchange.step.id === EXCHANGE_STEPS.BASE && exchange.fullConfig && (
          <Box fill="horizontal" direction="row" gap="12px" wrap>
            <Option
              label=""
              description="All Tokens"
              help=""
              checked={exchange.token === TOKEN.ALL}
              icon={<img className={s.imgToken} src="/busd.svg" />}
              onClick={() => {
                exchange.clear();
                exchange.setToken(TOKEN.ALL);
                routing.push(`/${exchange.token}`);
              }}
            />
            {exchange.config.tokens.includes(TOKEN.BUSD) && (
              <Option
                label="Binance"
                description="BUSD"
                help="Token"
                checked={exchange.token === TOKEN.BUSD}
                icon={<img className={s.imgToken} src="/busd.svg" />}
                onClick={() => {
                  exchange.setToken(TOKEN.BUSD);
                  routing.push(`/${exchange.token}`);
                }}
              />
            )}

            {exchange.config.tokens.includes(TOKEN.LINK) && (
              <Option
                label="BSC"
                description="LINK"
                help="Token"
                checked={exchange.token === TOKEN.LINK}
                icon={<img className={s.imgToken} src="/link.png" />}
                onClick={() => {
                  exchange.setToken(TOKEN.LINK);
                  routing.push(`/${exchange.token}`);
                }}
              />
            )}

            {exchange.config.tokens.includes(TOKEN.ERC20) && (
              <Option
                label={
                  exchange.network === NETWORK_TYPE.ETHEREUM
                    ? 'Ethereum'
                    : 'Binance'
                }
                description={
                  exchange.network === NETWORK_TYPE.ETHEREUM ? 'ERC20' : 'BEP20'
                }
                help="Tokens"
                checked={exchange.token === TOKEN.ERC20}
                icon={
                  <img
                    className={s.imgToken}
                    src={NETWORK_ICON[exchange.network]}
                  />
                }
                onClick={() => {
                  user.resetTokens();

                  exchange.setToken(TOKEN.ERC20);
                  routing.push(`/${exchange.token}`);
                }}
              />
            )}

            {exchange.network === NETWORK_TYPE.BINANCE &&
              exchange.config.tokens.includes(TOKEN.HRC20) && (
                <Option
                  label="Harmony"
                  description="HRC20"
                  help="Tokens"
                  checked={exchange.token === TOKEN.HRC20}
                  icon={<img className={s.imgToken} src="/one.svg" />}
                  onClick={() => {
                    user.resetTokens();

                    exchange.setToken(TOKEN.HRC20);
                    routing.push(`/${exchange.token}`);
                  }}
                />
              )}

            {exchange.config.tokens.includes(TOKEN.ERC721) && (
              <Option
                label="Ethereum"
                description="ERC721"
                help="Tokens"
                checked={exchange.token === TOKEN.ERC721}
                icon={<img className={s.imgToken} src="/eth.svg" />}
                onClick={() => {
                  user.resetTokens();

                  exchange.setToken(TOKEN.ERC721);
                  routing.push(`/${exchange.token}`);
                }}
              />
            )}

            {exchange.config.tokens.includes(TOKEN.HRC721) && (
              <Option
                label="Harmony"
                description="HRC721"
                help="Tokens"
                checked={exchange.token === TOKEN.HRC721}
                icon={<img className={s.imgToken} src="/one.svg" />}
                onClick={() => {
                  user.resetTokens();

                  exchange.setToken(TOKEN.HRC721);
                  routing.push(`/${exchange.token}`);
                }}
              />
            )}

            {exchange.config.tokens.includes(TOKEN.ERC1155) && (
              <Option
                label="Ethereum"
                description="ERC1155"
                help="Tokens"
                checked={exchange.token === TOKEN.ERC1155}
                icon={<img className={s.imgToken} src="/eth.svg" />}
                onClick={() => {
                  user.resetTokens();

                  exchange.setToken(TOKEN.ERC1155);
                  routing.push(`/${exchange.token}`);
                }}
              />
            )}

            {exchange.config.tokens.includes(TOKEN.HRC1155) && (
              <Option
                label="Harmony"
                description="HRC1155"
                help="Tokens"
                checked={exchange.token === TOKEN.HRC1155}
                icon={<img className={s.imgToken} src="/one.svg" />}
                onClick={() => {
                  user.resetTokens();

                  exchange.setToken(TOKEN.HRC1155);
                  routing.push(`/${exchange.token}`);
                }}
              />
            )}

            {exchange.config.tokens.includes(TOKEN.ETH) && (
              <Option
                label={NETWORK_NAME[exchange.network]}
                description={NETWORK_BASE_TOKEN[exchange.network]}
                help="Token"
                checked={exchange.token === TOKEN.ETH}
                icon={
                  <img
                    className={s.imgToken}
                    src={NETWORK_ICON[exchange.network]}
                  />
                }
                onClick={() => {
                  routing.push(`/${exchange.token}`);
                  exchange.setToken(TOKEN.ETH);
                }}
              />
            )}

            {exchange.config.tokens.includes(TOKEN.ONE) && (
              <Option
                label="Harmony"
                description="ONE"
                help="Token"
                checked={exchange.token === TOKEN.ONE}
                icon={<img className={s.imgToken} src="/one.svg" />}
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
              />
            )}
          </Box>
        )}
      </ModalContainer>
    </Box>
  );
});

TokenSettingsModal.displayName = 'TokenSettingsModal';
