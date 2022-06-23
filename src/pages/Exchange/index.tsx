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
import { Button, Icon, Text, Title } from 'components/Base';
import { divDecimals, formatWithSixDecimals, moreThanZero } from 'utils';
import { Spinner } from 'ui';
import { EXCHANGE_STEPS } from '../../stores/Exchange';
import { Details } from './Details';
import { AuthWarning } from '../../components/AuthWarning';
import { Steps } from './Steps';
import { autorun, computed, observable } from 'mobx';
import { EXCHANGE_MODE, NETWORK_TYPE, TOKEN } from 'stores/interfaces';
import cn from 'classnames';
import { ERC20Select } from './ERC20Select';
import { TokensField } from './AmountField';
import { MetamaskWarning } from '../../components/MetamaskWarning';
import { ApproveAmountField } from './ApproveAmountField';
import { NETWORK_BASE_TOKEN, NETWORK_ICON } from '../../stores/names';
import { getExNetworkMethods } from '../../blockchain-bridge/eth';
import { AddTokenPanel } from './AddTokenPanel';
import { threshold, validators } from '../../services';

export interface ITokenInfo {
  label: string;
  maxAmount: string;
}

@inject('user', 'exchange', 'actionModals', 'userMetamask', 'routing', 'tokens')
@observer
export class Exchange extends React.Component<
  Pick<IStores, 'user'> &
    Pick<IStores, 'exchange'> &
    Pick<IStores, 'routing'> &
    Pick<IStores, 'tokens'> &
    Pick<IStores, 'actionModals'> &
    Pick<IStores, 'tokens'> &
    Pick<IStores, 'userMetamask'>
> {
  formRef: MobxForm;

  @observable metamaskNetworkError = '';
  @observable addressValidationError = '';

  constructor(props) {
    super(props);

    autorun(() => {
      const { exchange } = this.props;

      if (exchange.token && exchange.mode && exchange.network) {
        if (this.formRef) {
          this.formRef.resetTouched();
          this.formRef.resetErrors();
          this.addressValidationError = '';
        }

        if (exchange.token === TOKEN.ERC721 || exchange.token === TOKEN.HRC721) {
          exchange.transaction.amount = ['0'];
        } else {
          exchange.transaction.amount = '0';
        }

        if (exchange.token === TOKEN.ERC1155 || exchange.token === TOKEN.HRC1155) {
          exchange.transaction.hrc1155TokenId = '0';
        }
      }
    });
  }

  onClickHandler = async (needValidate: boolean, callback: () => void) => {
    const { actionModals, user, userMetamask, exchange } = this.props;
    exchange.error = '';

    if (true) {
      return actionModals.open(
        () => (
          <Box pad="large">
            <Text>
              <b>The work of the bridge is temporarily suspended.</b>
              <br />
              We do our best to resume it as quickly as possible.
              <br />
              Sorry for the inconvenience.
            </Text>
          </Box>
        ),
        {
          title: '',
          applyText: 'Got it',
          closeText: '',
          noValidation: true,
          width: '500px',
          showOther: true,
          onApply: () => {
            return Promise.resolve();
          },
        },
      );
    }

    // if (
    //   exchange.mode === EXCHANGE_MODE.ONE_TO_ETH &&
    //   exchange.network === NETWORK_TYPE.BINANCE
    // ) {
    //   return actionModals.open(
    //     () => (
    //       <Box pad="large">
    //         <Text>
    //           <b>Harmony Bridge is temporarily suspended.</b>
    //           <br />
    //           <br />
    //           We are currently facing RPC issue on the Harmony side which we are
    //           actively working to resolve.
    //           <br />
    //           Meanwhile, we have disabled bridging temporarily.
    //           <br />
    //           <br />
    //           Sorry for the inconvenience. We will update soon.
    //         </Text>
    //       </Box>
    //     ),
    //     {
    //       title: '',
    //       applyText: 'Got it',
    //       closeText: '',
    //       noValidation: true,
    //       width: '500px',
    //       showOther: true,
    //       onApply: () => {
    //         return Promise.resolve();
    //       },
    //     },
    //   );
    // }

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
      if (exchange.mode === EXCHANGE_MODE.ONE_TO_ETH) {
        const methods = getExNetworkMethods();

        if (!methods.web3.utils.isAddress(exchange.transaction.ethAddress)) {
          this.addressValidationError = 'Invalid wallet Hex address';
          return;
        }
      }

      if (
        this.props.tokens.allData.some(
          t =>
            t.erc20Address.toLowerCase() ===
              exchange.transaction.ethAddress.toLowerCase() ||
            t.hrc20Address.toLowerCase() ===
              exchange.transaction.ethAddress.toLowerCase() ||
            t.erc20Address.toLowerCase() ===
              exchange.transaction.oneAddress.toLowerCase() ||
            t.hrc20Address.toLowerCase() ===
              exchange.transaction.oneAddress.toLowerCase(),
        )
      ) {
        this.addressValidationError =
          'You enter bridge contract address. Transfer to this address will result in loss of funds! Please, use only your wallet address';
        return;
      }

      this.formRef.validateFields().then(async () => {
        try {
          if (this.props.exchange.step.id === EXCHANGE_STEPS.BASE) {
            await new Promise((res, rej) => {
              actionModals.open(
                () => (
                  <Box pad="large">
                    <Text>
                      <Title>Important</Title>
                      <br />
                      <li>Bridge does not swap tokens, it only wraps it.</li>
                      <br />
                      <li>
                        Never use exchange wallet (e.g. Binance) in bridge
                      </li>
                      <br />
                      <li>Double check the receiver address</li>
                      <br />
                      <li>
                        Make sure that the token you are bridging has liquidity
                        (or use) on Harmony
                      </li>
                      <br />
                      <li>
                        Make sure to select the correct token type (if doubt, go
                        to Need Help or FAQ sections)
                      </li>
                    </Text>
                  </Box>
                ),
                {
                  title: '',
                  applyText: 'Yes I confirm',
                  closeText: 'Cancel',
                  noValidation: true,
                  width: '500px',
                  showOther: true,
                  onApply: () => {
                    res();
                    return Promise.resolve();
                  },
                  onClose: () => {
                    rej();
                    return Promise.resolve();
                  },
                },
              );
            });
          }
        } catch (e) {
          return;
        }

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

      case TOKEN.HRC721:
      case TOKEN.ERC1155:
      case TOKEN.HRC1155:
      case TOKEN.ERC721:
      case TOKEN.ERC20:
      case TOKEN.HRC20:
        return {
          label: userMetamask.erc20TokenDetails ? userMetamask.erc20TokenDetails.symbol : '',
          maxAmount:
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
              ? user.hrc20Balance
              : userMetamask.erc20Balance,
        };

      case TOKEN.ETH:
        return {
          label: NETWORK_BASE_TOKEN[this.props.exchange.network],
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
          <Box direction="column" align="center">
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
            <Box margin={{ vertical: 'small' }}>
              <Text>Success</Text>
            </Box>
            {exchange.operation.type === EXCHANGE_MODE.ETH_TO_ONE &&
            [
              TOKEN.ERC20,
              TOKEN.ETH,
              TOKEN.BUSD,
              TOKEN.LINK,
              TOKEN.ERC721,
              TOKEN.HRC721,
              TOKEN.ERC1155,
              TOKEN.HRC1155,
            ].includes(exchange.token) ? (
              <Box
                pad={{ horizontal: 'medium', vertical: 'small' }}
                style={{ background: 'white' }}
              >
                <Text style={{ textAlign: 'center' }} color="rgb(0, 173, 232)">
                  Bridged assets can only be used in the Harmony ecosystem and
                  currently no centralized exchange supports deposit of the
                  bridged assets.
                </Text>
              </Box>
            ) : null}
          </Box>
        );
        description = '';
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
          {description ? (
            <Text style={{ textAlign: 'center' }}>{description}</Text>
          ) : null}
          <Box margin={{ top: 'medium' }} style={{ width: '100%' }}>
            <Steps />
            {exchange.step.id === EXCHANGE_STEPS.RESULT ? (
              <AddTokenPanel position="center" />
            ) : null}
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
      <Box direction="column" className={styles.exchangeContainer}>
        {exchange.step.id === EXCHANGE_STEPS.BASE && exchange.fullConfig ? (
          <Box direction="row" wrap={true} align="center" justify="start">
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
                <Text>BUSD</Text>
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
                <Text>LINK</Text>
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
                <Text>
                  {exchange.network === NETWORK_TYPE.ETHEREUM
                    ? 'ERC20'
                    : 'BEP20'}
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
                  <Text>HRC20</Text>
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
                <Text>ERC721</Text>
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
                <Text>HRC721</Text>
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
                <Text>ERC1155</Text>
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
                <Text>HRC1155</Text>
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
                <Text>{NETWORK_BASE_TOKEN[exchange.network]}</Text>
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
                <Text>ONE</Text>
              </Box>
            )}
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
                <ERC20Select type={exchange.token} options={true} />
              ) : null}

              {exchange.token === TOKEN.ERC721 ? (
                <ERC20Select type={exchange.token} options={false} />
              ) : null}

              {exchange.token === TOKEN.HRC721 ? (
                <ERC20Select type={exchange.token} options={false} />
              ) : null}

              {exchange.token === TOKEN.HRC1155 ? (
                <ERC20Select type={exchange.token} options={false} />
              ) : null}

              {exchange.token === TOKEN.ERC1155 ? (
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
                {(exchange.token === TOKEN.ERC721 || exchange.token === TOKEN.HRC721) ? (
                  <TokensField
                    label={this.tokenInfo.label}
                    maxTokens={this.tokenInfo.maxAmount}
                  />
                ) : (exchange.token === TOKEN.ERC1155 || exchange.token === TOKEN.HRC1155) ? (
                  <NumberInput
                    label={`${this.tokenInfo.label} Amount`}
                    name="amount"
                    type="decimal"
                    precision="0"
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
                ): (
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
                {exchange.token !== TOKEN.ERC721 && exchange.token !== TOKEN.HRC721 && exchange.token !== TOKEN.ERC1155 && exchange.token !== TOKEN.HRC1155 ? (
                  <Text size="small" style={{ textAlign: 'right' }}>
                    <b>*Max Available</b> ={' '}
                    {formatWithSixDecimals(this.tokenInfo.maxAmount)}{' '}
                    {this.tokenInfo.label}
                  </Text>
                ) : null}
                {(exchange.token === TOKEN.HRC1155 || exchange.token === TOKEN.ERC1155) ? (
                  <Text size="small" style={{ textAlign: 'right' }}>
                    <b>*Max Available</b> ={' '}
                    {this.tokenInfo.maxAmount || '0'}{' '}
                    {this.tokenInfo.label}
                  </Text>
                ) : null}
              </Box>

              {exchange.mode === EXCHANGE_MODE.ONE_TO_ETH ? (
                <Box direction="column" fill={true}>
                  <Box
                    direction="column"
                    align="start"
                    margin={{ bottom: '6px' }}
                  >
                    <Text
                      style={{
                        fontSize: '18px',
                        color: '#212D5E',
                        fontWeight: 'bold',
                      }}
                    >
                      {`${NETWORK_BASE_TOKEN[exchange.network]} address`}
                    </Text>
                    <Text color="#9698a7" size="small">
                      only use your wallet address, never use contract address
                    </Text>
                  </Box>
                  <Input
                    label=""
                    name="ethAddress"
                    style={{ width: '100%' }}
                    placeholder="Receiver address"
                    rules={[isRequired]}
                    onChange={() => (this.addressValidationError = '')}
                  />
                  {userMetamask.isAuthorized ? (
                    <Box
                      fill={true}
                      style={{
                        color: 'rgb(0, 173, 232)',
                        textAlign: 'right',
                      }}
                      onClick={() => {
                        exchange.transaction.ethAddress =
                          userMetamask.ethAddress;
                        this.addressValidationError = '';
                      }}
                    >
                      Use my address
                    </Box>
                  ) : user.isAuthorized && user.sessionType === 'metamask' ? (
                    <Box
                      fill={true}
                      style={{
                        color: 'rgb(0, 173, 232)',
                        textAlign: 'right',
                      }}
                      onClick={() => {
                        exchange.transaction.ethAddress = user.address;
                        this.addressValidationError = '';
                      }}
                    >
                      Use Metamask address
                    </Box>
                  ) : null}
                </Box>
              ) : (
                <Box direction="column" fill={true}>
                  <Box
                    direction="column"
                    align="start"
                    margin={{ bottom: '6px' }}
                  >
                    <Text
                      style={{
                        fontSize: '18px',
                        color: '#212D5E',
                        fontWeight: 'bold',
                      }}
                    >
                      ONE Address
                    </Text>
                    <Text color="#9698a7" size="small">
                      only use your wallet address, never use contract address
                    </Text>
                  </Box>
                  <Input
                    label=""
                    name="oneAddress"
                    style={{ width: '100%' }}
                    placeholder="Receiver address"
                    rules={[isRequired]}
                    onChange={() => (this.addressValidationError = '')}
                  />
                  {user.isAuthorized ? (
                    <Box
                      fill={true}
                      style={{
                        color: 'rgb(0, 173, 232)',
                        textAlign: 'right',
                      }}
                      onClick={() => {
                        exchange.transaction.oneAddress = user.address;
                        this.addressValidationError = '';
                      }}
                    >
                      Use my address
                    </Box>
                  ) : userMetamask.isAuthorized ? (
                    <Box
                      fill={true}
                      style={{
                        color: 'rgb(0, 173, 232)',
                        textAlign: 'right',
                      }}
                      onClick={() => {
                        exchange.transaction.oneAddress =
                          userMetamask.ethAddress;

                        this.addressValidationError = '';
                      }}
                    >
                      Use Metamask address
                    </Box>
                  ) : null}
                </Box>
              )}
            </Box>
          ) : null}

          {exchange.step.id === EXCHANGE_STEPS.APPROVE ? (
            <ApproveAmountField tokenInfo={this.tokenInfo} />
          ) : null}
        </Form>

        {this.addressValidationError ? (
          <Text color="red">{this.addressValidationError}</Text>
        ) : null}

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
          {exchange.allowanceStatus === 'fetching' ? (
            <Spinner />
          ) : (
            exchange.step.buttons.map((conf, idx) => (
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
            ))
          )}
        </Box>
      </Box>
    );
  }
}
