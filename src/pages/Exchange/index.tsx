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
import { Button, Checkbox, Icon, Select, Text } from 'components/Base';
import { formatWithSixDecimals, moreThanZero } from 'utils';
import { Spinner } from 'ui/Spinner';
import { EXCHANGE_STEPS } from '../../stores/Exchange';
import { Details } from './Details';
import { AuthWarning } from '../../components/AuthWarning';
import { Steps } from './Steps';
import { autorun, computed, observable } from 'mobx';
import { TOKEN, EXCHANGE_MODE } from 'stores/interfaces';
import cn from 'classnames';
import { ERC20Select } from './ERC20Select';

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

  constructor(props) {
    super(props);

    autorun(() => {
      const { exchange } = this.props;

      if (exchange.token && exchange.mode) {
        if (this.formRef) {
          this.formRef.resetTouched();
          this.formRef.resetErrors();
        }
      }
    });
  }

  onClickHandler = async (needValidate: boolean, callback: () => void) => {
    const { actionModals, user, userMetamask, exchange } = this.props;

    if (!user.isAuthorized) {
      if (exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
        if (!user.isKeplrWallet) {
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
      exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT
    ) {
      if (!userMetamask.isAuthorized) {
        await userMetamask.signIn(true);
      }
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
      /*
      case TOKEN.ETH:
        return {
          label: 'ETH',
          maxAmount:
            exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH
              ? user.balance
              : userMetamask.ethBalance,
        };
      case TOKEN.LINK:
        return {
          label: 'LINK',
          maxAmount:
            exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH
              ? user.hmyLINKBalance
              : userMetamask.ethLINKBalance,
        };
*/
      case TOKEN.ERC20:
        if (!userMetamask.erc20TokenDetails) {
          return { label: '', maxAmount: '0' };
        }

        return {
          label: userMetamask.erc20TokenDetails.symbol,
          maxAmount:
            exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH
              ? user.snip20Balance
              : userMetamask.erc20Balance,
        };

      default:
        if (exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
          return {
            label: 'sETH',
            maxAmount: user.balance_sETH,
          };
        } else {
          return {
            label: 'ETH',
            maxAmount: userMetamask.ethBalance,
          };
        }
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
          <Box direction="row">
            <Box
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.ETH ? styles.selected : '',
              )}
              onClick={() => {
                exchange.setToken(TOKEN.ETH);
                routing.push(`/${exchange.token}`);
              }}
            >
              <img className={styles.imgToken} src="/eth.svg" />
              <Text>
                {exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH ? 'sETH' : 'ETH'}
              </Text>
            </Box>

            <Box
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.ERC20 ? styles.selected : '',
              )}
              onClick={() => {
                exchange.setToken(TOKEN.ERC20);
                routing.push(`/${exchange.token}`);
              }}
            >
              <img className={styles.imgToken} src="/eth.svg" />
              <Text>
                {exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH
                  ? 'SNIP20'
                  : 'ERC20'}
              </Text>
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
              {exchange.token === TOKEN.ERC20 ? <ERC20Select /> : null}

              <Box
                direction="column"
                gap="2px"
                fill={true}
                margin={{ top: 'xlarge', bottom: 'large' }}
              >
                <NumberInput
                  label={`${(exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH &&
                  exchange.token === TOKEN.ERC20 &&
                  this.tokenInfo.label
                    ? 's'
                    : '') + this.tokenInfo.label} Amount`}
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
                <Text size="small" style={{ textAlign: 'right' }}>
                  <b>*Max Available</b> ={' '}
                  {formatWithSixDecimals(this.tokenInfo.maxAmount)}{' '}
                  {(exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH &&
                  exchange.token === TOKEN.ERC20
                    ? 's'
                    : '') + this.tokenInfo.label}
                </Text>
              </Box>

              {exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH ? (
                <Box direction="column" fill={true}>
                  <Input
                    label="Destination ETH Address"
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
                    label="Destination Secret Address"
                    name="scrtAddress"
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
                        (exchange.transaction.scrtAddress = user.address)
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
            {exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? (
              <Box
                direction="row"
                // justify="end"
                fill={true}
                margin={{ top: 'small' }}
              >
                <Text color="Red500" style={{ textAlign: 'right' }}>
                  Metamask may ask you to sign with slightly higher fee due to
                  150000 gas limit estimate, however you will be charged similar
                  to the above estimate based on the actual gas used.
                </Text>
              </Box>
            ) : null}
            <Box
              direction="row"
              // justify="end"
              margin={{
                top:
                  exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT
                    ? 'medium'
                    : '0px',
              }}
              fill={true}
            >
              <Text color="Red500" style={{ textAlign: 'right' }}>
                You will be prompted to sign one transaction
              </Text>
            </Box>
          </>
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
