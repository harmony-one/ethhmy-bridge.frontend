import * as React from 'react';
import { Box } from 'grommet';
import * as styles from './styles.styl';
import {
  Form,
  Input,
  isRequired,
  MobxForm,
  NumberInput,
} from 'components/Form';
import { inject, observer } from 'mobx-react';
import { IStores } from 'stores';
import { Button, Icon, Text } from 'components/Base';
import { divDecimals, formatWithSixDecimals, moreThanZero } from 'utils';
import { Spinner, Error } from 'ui';
import { EXCHANGE_STEPS } from '../../stores/Exchange';
import { Details } from './Details';
import { AuthWarning } from '../../components/AuthWarning';
import { Steps } from './Steps';
import { autorun, computed, observable } from 'mobx';
import { EXCHANGE_MODE, TOKEN } from 'stores/interfaces';
import cn from 'classnames';
import { ERC20Select } from './ERC20Select';
import { TokensField } from './AmountField';
import { MetamaskWarning } from '../../components/MetamaskWarning';

export interface ITokenInfo {
  label: string;
  maxAmount: string;
}

@inject('user', 'exchange', 'actionModals', 'userMetamask', 'routing')
@observer
export class Exchange extends React.Component<
  Pick<IStores, 'user'> &
    Pick<IStores, 'exchange'> &
    Pick<IStores, 'routing'> &
    Pick<IStores, 'actionModals'> &
    Pick<IStores, 'userMetamask'>
> {
  formRef: MobxForm;

  @observable metamaskNetworkError = '';

  constructor(props) {
    super(props);

    autorun(() => {
      const { exchange } = this.props;

      if (exchange.token && exchange.mode) {
        if (this.formRef) {
          this.formRef.resetTouched();
          this.formRef.resetErrors();
        }

        if (exchange.token === TOKEN.ERC721) {
          exchange.transaction.amount = ['0'];
        } else {
          exchange.transaction.amount = '0';
        }
      }
    });
  }

  onClickHandler = async (needValidate: boolean, callback: () => void) => {
    const { actionModals, user, userMetamask, exchange } = this.props;
    exchange.error = '';

    if (!user.isAuthorized) {
      if (exchange.mode === EXCHANGE_MODE.ONE_TO_ETH) {
        if (!user.isOneWallet) {
          return actionModals.open(() => <AuthWarning />, {
            title: '',
            applyText: 'Got it',
            closeText: '',
            noValidation: true,
            width: '500px',
            showOther: true,
            onApply: () => {
              return Promise.resolve();
            },
          });
        } else {
          await user.signIn();
        }
      }
    }

    if (
      !userMetamask.isAuthorized &&
      exchange.mode === EXCHANGE_MODE.ETH_TO_ONE
    ) {
      if (!userMetamask.isAuthorized) {
        await userMetamask.signIn(true);
      }
    }

    if (
      exchange.mode === EXCHANGE_MODE.ONE_TO_ETH &&
      user.isMetamask &&
      !user.isNetworkActual
    ) {
      return actionModals.open(() => <MetamaskWarning />, {
        title: '',
        applyText: 'Got it',
        closeText: '',
        noValidation: true,
        width: '500px',
        showOther: true,
        onApply: () => {
          return Promise.resolve();
        },
      });
    }

    if ([TOKEN.ERC721].includes(exchange.token) && !userMetamask.erc20Address) {
      exchange.error = 'No token selected ';
      throw 'No token selected ';
    }

    if (needValidate) {
      this.formRef.validateFields().then(() => {
        callback();
      });
    } else {
      callback();
    }
  };

  @computed
  get tokenInfo(): ITokenInfo {
    const { user, exchange, userMetamask } = this.props;

    switch (exchange.token) {
      case TOKEN.BUSD:
        return {
          label: 'BUSD',
          maxAmount:
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
              ? user.hmyBUSDBalance
              : userMetamask.ethBUSDBalance,
        };
      case TOKEN.LINK:
        return {
          label: 'LINK',
          maxAmount:
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
              ? user.hmyLINKBalance
              : userMetamask.ethLINKBalance,
        };

      case TOKEN.ERC721:
      case TOKEN.ERC20:
      case TOKEN.HRC20:
        if (!userMetamask.erc20TokenDetails) {
          return { label: '', maxAmount: '0' };
        }

        return {
          label: userMetamask.erc20TokenDetails.symbol,
          maxAmount:
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
              ? user.hrc20Balance
              : userMetamask.erc20Balance,
        };

      case TOKEN.ETH:
        return {
          label: 'ETH',
          maxAmount:
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
              ? user.hrc20Balance
              : userMetamask.ethBalance,
        };

      case TOKEN.ONE:
        return {
          label: 'ONE',
          maxAmount:
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
              ? divDecimals(user.balance, 18)
              : userMetamask.erc20Balance,
        };

      default:
        return {
          label: 'BUSD',
          maxAmount:
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
              ? user.hmyBUSDBalance
              : userMetamask.ethBUSDBalance,
        };
    }
  }

  render() {
    const { exchange, routing, user, userMetamask } = this.props;

    let icon = () => <Icon style={{ width: 50 }} glyph="RightArrow" />;
    let description = 'Approval';

    switch (exchange.actionStatus) {
      case 'fetching':
        icon = () => <Spinner />;
        description = '';
        break;

      case 'error':
        icon = () => <Icon size="50" style={{ width: 50 }} glyph="Alert" />;
        description = exchange.error;
        break;

      case 'success':
        icon = () => (
          <Box
            style={{
              background: '#1edb89',
              borderRadius: '50%',
            }}
          >
            <Icon
              size="50"
              style={{ width: 50, color: 'white' }}
              glyph="CheckMark"
            />
          </Box>
        );
        description = 'Success';
        break;
    }

    const Status = () => (
      <Box
        direction="column"
        align="center"
        justify="center"
        fill={true}
        pad="medium"
        style={{ background: '#dedede40' }}
      >
        {icon()}
        <Box
          className={styles.description}
          margin={{ top: 'medium' }}
          pad={{ horizontal: 'small' }}
          style={{ width: '100%' }}
        >
          <Text style={{ textAlign: 'center' }}>{description}</Text>
          <Box margin={{ top: 'medium' }} style={{ width: '100%' }}>
            <Steps />
          </Box>
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
    );

    return (
      <Box direction="column" pad="xlarge" className={styles.exchangeContainer}>
        {exchange.step.id === EXCHANGE_STEPS.BASE ? (
          <Box direction="row" wrap={true} align="center" justify="start">
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
              <Text>BUSD</Text>
            </Box>

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
              <Text>LINK</Text>
            </Box>

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
              <img className={styles.imgToken} src="/eth.svg" />
              <Text>ERC20</Text>
            </Box>

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
              <Text>HRC20</Text>
            </Box>

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
              <Text>ERC721</Text>
            </Box>

            <Box
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.ETH ? styles.selected : '',
              )}
              onClick={() => {
                exchange.setToken(TOKEN.ETH);
                routing.push(`/${exchange.token}`);
                user.setHRC20Token(process.env.ETH_HRC20);
                userMetamask.setTokenDetails({
                  name: 'ETH',
                  decimals: '18',
                  erc20Address: '',
                  symbol: 'ETH',
                });
              }}
            >
              <img className={styles.imgToken} src="/eth.svg" />
              <Text>ETH</Text>
            </Box>

            <Box
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.ONE ? styles.selected : '',
              )}
              onClick={() => {
                exchange.setToken(TOKEN.ONE);
                routing.push(`/${exchange.token}`);

                user.setHRC20Mapping(process.env.ONE_HRC20, true);

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
              <Text>ONE</Text>
            </Box>
          </Box>
        ) : null}

        <Form
          ref={ref => (this.formRef = ref)}
          data={this.props.exchange.transaction}
          {...({} as any)}
        >
          {exchange.step.id === EXCHANGE_STEPS.BASE ? (
            <Box direction="column" fill={true}>
              {/*<Box direction="column" fill={true}>*/}
              {/*  <Input*/}
              {/*    label="ERC20 Address"*/}
              {/*    name="erc20Address"*/}
              {/*    style={{ width: '100%' }}*/}
              {/*    placeholder="ERC20 address"*/}
              {/*    rules={[isRequired]}*/}
              {/*  />*/}
              {/*  <Box direction="row" justify="end">*/}
              {/*    <Button*/}
              {/*      onClick={() => {*/}
              {/*        userMetamask.setToken(exchange.transaction.erc20Address);*/}
              {/*      }}*/}
              {/*    >*/}
              {/*      Check address*/}
              {/*    </Button>*/}
              {/*  </Box>*/}
              {/*</Box>*/}

              {exchange.token === TOKEN.ERC20 ? (
                <ERC20Select type={exchange.token} options={true} />
              ) : null}

              {exchange.token === TOKEN.HRC20 ? (
                <ERC20Select type={exchange.token} options={false} />
              ) : null}

              {exchange.token === TOKEN.ERC721 ? (
                <ERC20Select type={exchange.token} options={false} />
              ) : null}

              {exchange.step.id === EXCHANGE_STEPS.BASE ? (
                <Box margin={{ top: 'small' }} align="start">
                  <Text color="red">{exchange.error}</Text>
                </Box>
              ) : null}

              {/*<Box direction="column" fill={true}>*/}
              {/*  <TokenDetails />*/}
              {/*</Box>*/}

              <Box
                direction="column"
                gap="2px"
                fill={true}
                margin={{ top: 'xlarge', bottom: 'large' }}
              >
                {exchange.token === TOKEN.ERC721 ? (
                  <TokensField
                    label={this.tokenInfo.label}
                    maxTokens={this.tokenInfo.maxAmount}
                  />
                ) : (
                  <NumberInput
                    label={`${this.tokenInfo.label} Amount`}
                    name="amount"
                    type="decimal"
                    precision="6"
                    delimiter="."
                    placeholder="0"
                    style={{ width: '100%' }}
                    rules={[
                      isRequired,
                      moreThanZero,
                      (_, value, callback) => {
                        const errors = [];

                        if (
                          value &&
                          Number(value) > Number(this.tokenInfo.maxAmount)
                        ) {
                          const defaultMsg = `Exceeded the maximum amount`;
                          errors.push(defaultMsg);
                        }

                        callback(errors);
                      },
                    ]}
                  />
                )}
                {exchange.token !== TOKEN.ERC721 ? (
                  <Text size="small" style={{ textAlign: 'right' }}>
                    <b>*Max Available</b> ={' '}
                    {formatWithSixDecimals(this.tokenInfo.maxAmount)}{' '}
                    {this.tokenInfo.label}
                  </Text>
                ) : null}
              </Box>

              {exchange.mode === EXCHANGE_MODE.ONE_TO_ETH ? (
                <Box direction="column" fill={true}>
                  <Input
                    label="ETH Address"
                    name="ethAddress"
                    style={{ width: '100%' }}
                    placeholder="Receiver address"
                    rules={[isRequired]}
                  />
                  {userMetamask.isAuthorized ? (
                    <Box
                      fill={true}
                      style={{
                        color: 'rgb(0, 173, 232)',
                        textAlign: 'right',
                      }}
                      onClick={() =>
                        (exchange.transaction.ethAddress =
                          userMetamask.ethAddress)
                      }
                    >
                      Use my address
                    </Box>
                  ) : null}
                </Box>
              ) : (
                <Box direction="column" fill={true}>
                  <Input
                    label="ONE Address"
                    name="oneAddress"
                    style={{ width: '100%' }}
                    placeholder="Receiver address"
                    rules={[isRequired]}
                  />
                  {user.isAuthorized ? (
                    <Box
                      fill={true}
                      style={{
                        color: 'rgb(0, 173, 232)',
                        textAlign: 'right',
                      }}
                      onClick={() =>
                        (exchange.transaction.oneAddress = user.address)
                      }
                    >
                      Use my address
                    </Box>
                  ) : null}
                </Box>
              )}
            </Box>
          ) : null}
        </Form>

        {exchange.step.id === EXCHANGE_STEPS.CONFIRMATION ? (
          <Details showTotal={true} />
        ) : null}

        {exchange.step.id === EXCHANGE_STEPS.SENDING ? (
          <Details>
            <Status />
          </Details>
        ) : null}

        {exchange.step.id === EXCHANGE_STEPS.RESULT ? (
          <Details>
            <Status />
          </Details>
        ) : null}

        {exchange.step.id === EXCHANGE_STEPS.CONFIRMATION ? (
          <>
            {exchange.mode === EXCHANGE_MODE.ETH_TO_ONE ? (
              <Box
                direction="row"
                justify="end"
                fill={true}
                margin={{ top: 'small' }}
              >
                <Text color="Red500" style={{ textAlign: 'right' }}>
                  The metamask may ask you to sign with slightly higher fee due
                  to 150000 gas limit estimate, however you will be charged
                  similar to the above estimate based on the actual gas used.
                </Text>
              </Box>
            ) : null}
            <Box
              direction="row"
              justify="end"
              margin={{
                top:
                  exchange.mode === EXCHANGE_MODE.ETH_TO_ONE ? 'medium' : '0px',
              }}
              fill={true}
            >
              <Text color="Red500" style={{ textAlign: 'right' }}>
                You will be prompted to sign several transactions
              </Text>
            </Box>
          </>
        ) : null}

        {this.metamaskNetworkError ? (
          <Box>{this.metamaskNetworkError}</Box>
        ) : null}

        <Box
          direction="row"
          margin={{ top: 'large' }}
          justify="end"
          align="center"
        >
          {exchange.step.buttons.map((conf, idx) => (
            <Button
              key={idx}
              bgColor="#00ADE8"
              style={{ width: conf.transparent ? 140 : 180 }}
              onClick={() => {
                this.onClickHandler(conf.validate, conf.onClick);
              }}
              transparent={!!conf.transparent}
            >
              {conf.title}
            </Button>
          ))}
        </Box>
      </Box>
    );
  }
}
