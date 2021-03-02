import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Icon, Text, Title } from 'components/Base';
import * as styles from '../styles.styl';
import { Box } from 'grommet';
import Web3 from 'web3';
import * as bech32 from 'bech32';
import { IStores } from 'stores';
import { unlockToken } from 'utils';
import { EXCHANGE_MODE, TOKEN } from 'stores/interfaces';
import { Form, Input, NumberInput, MobxForm } from 'components/Form';
import { ERC20Select } from '../ERC20Select';
import { AuthWarning } from '../../../components/AuthWarning';
import { EXCHANGE_STEPS } from '../../../stores/Exchange';
import Loader from 'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import { autorun } from 'mobx';
import Fade from 'react-reveal/Fade';
import { useStores } from 'stores';

type State = {
    tokenError: string,
    amountError: string,
    addressError: string,
    tokenLocked: boolean,
};

interface ITokenInfo {
    symbol: string;
    image: any;
    address: string;
}

type NetworkTemplateInterface = {
    name: string,
    wallet: string
    image: string
    symbol: string
    amount: string;
}

const validateTokenInput = (token: any) => {
    if (!token || !token.symbol) return 'This field is required.'
    return ""
}


const validateAmountInput = (value: string, minAmount: any, maxAmount: any) => {
    if (!value || !value.trim() || Number(value) <= 0) return 'This field is required.'
    if (Number(value) > Number(maxAmount)) return 'Exceeded the maximum amount.'
    if (Number(value) < Number(minAmount)) return 'Below the minimum amount.'

    return ""
}


const validateAddressInput = (exchange: any) => {
    const value = exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH ? exchange.transaction.ethAddress : exchange.transaction.scrtAddress
    if (exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
        const web3 = new Web3();
        if (!web3.utils.isAddress(value) || !web3.utils.checkAddressChecksum(value)) return 'Not a valid Ethereum Address.'
    }
    if (exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT) {
        if (!value.startsWith('secret')) return 'Not a valid Secret Address.'

        try {
            bech32.decode(value);
        } catch (error) {
            return 'Not a valid Secret Address.'
        }
    }
    return ""
}

const getBalance = (exchange, userMetamask, user) => {
    let minAmount = "loading"
    let maxAmount = "loading"


    if (exchange.token === TOKEN.ERC20) {
        if (!userMetamask.erc20TokenDetails) {
            maxAmount = "0"
            minAmount = "0"
        }
        if (exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
            maxAmount = (!user.snip20Balance || user.snip20Balance.includes(unlockToken)) ? '0' : user.snip20Balance
            minAmount = user.snip20BalanceMin || '0'
        }
        if (exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT) {
            maxAmount = userMetamask.erc20Balance
            minAmount = userMetamask.erc20BalanceMin || '0'
        }
    } else {
        if (exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
            maxAmount = (!user.balanceToken['Ethereum'] || user.balanceToken['Ethereum'].includes(unlockToken)) ? '0' : user.balanceToken['Ethereum']
            minAmount = user.balanceTokenMin['Ethereum'] || '0'
        } else {
            maxAmount = exchange.transaction.tokenSelected.symbol === "ETH" ? userMetamask.ethBalance : "0"
            minAmount = exchange.transaction.tokenSelected.symbol === "ETH" ? (userMetamask.ethBalanceMin || "0") : "0"
        }
    }

    return { minAmount, maxAmount }
}


const renderNetworkTemplate = (template: NetworkTemplateInterface) => (
    <Box direction="column" style={{ minWidth: 230 }}>
        <Box direction="row" align="start" margin={{ bottom: 'small' }}>
            <img className={styles.imgToken} src={template.name === "Ethereum" ? "/static/eth.svg" : "/static/scrt.svg"} />
            <Box direction="column" margin={{ left: 'xsmall' }}>
                <Title bold color={"#30303D"} margin={{ bottom: 'xxsmall' }}>{template.name}</Title>
                <Text size="medium" bold color={"#748695"}>{template.wallet}</Text>
            </Box>
        </Box>

        <Box pad="xsmall" direction="row" align="center" justify="start" style={{ backgroundColor: "#E1FEF2", height: 44 }}>
            {template.image && <img src={template.image} style={{ width: 20, marginRight: 10 }} alt={template.symbol} />}
            {template.symbol && <Text bold color="#30303D" size="medium">{template.amount}</Text>}
            <Text bold margin={{ left: 'xxsmall' }} color="#748695" size="medium">{template.symbol}</Text>
        </Box>
    </Box>
)

const renderTokenLocked = (user: any) => <Box direction="column">
    <Text bold color="#c5bb2e">Warning</Text>
    <Text margin={{ top: 'xxsmall', bottom: 'xxsmall' }}>It seems this token viewing key is yet to be created, everything inside Secret Network is private by default so, in order for you to view this token balance, it is required a viewing key.
    </Text>
    <Box style={{ cursor: 'pointer' }} onClick={async () => {
        try {
            await user.keplrWallet.suggestToken(user.chainId, user.snip20Address);
        } catch (error) {
            console.error(error);
        }
    }}>
        <Text bold>Created one here</Text>
    </Box>

</Box>

@inject('user', 'exchange', 'actionModals', 'userMetamask', 'routing')
@observer
export class Base extends React.Component<
Pick<IStores, 'user'> &
Pick<IStores, 'exchange'> &
Pick<IStores, 'routing'> &
Pick<IStores, 'actionModals'> &
Pick<IStores, 'tokens'> &
Pick<IStores, 'userMetamask'>, State
> {
    formRef: MobxForm;

    constructor(props) {
        super(props);
        this.state = {
            amountError: "",
            addressError: "",
            tokenError: "",
            tokenLocked: false
        };

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


    render() {
        const { actionModals, user, userMetamask, exchange } = this.props;
        const { amountError, tokenError, addressError, tokenLocked } = this.state;
        const { minAmount, maxAmount } = getBalance(exchange, userMetamask, user)

        const selectedToken = exchange.transaction.tokenSelected
        const NTemplate1: NetworkTemplateInterface = {
            name: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? "Ethereum" : "Secret Network",
            wallet: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? "Metamask" : "Keplr",
            symbol: "No Token Selected",
            amount: exchange.transaction.amount,
            image: selectedToken.image

        }

        const NTemplate2: NetworkTemplateInterface = {
            name: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? "Secret Network" : "Ethereum",
            wallet: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? "Keplr" : "Metamask",
            symbol: "No Token Selected",
            amount: exchange.transaction.amount,
            image: selectedToken.image

        }

        const toApprove = !exchange.isTokenApproved && exchange.transaction.erc20Address !== ""

        const readyToSend =
            validateAddressInput(exchange) === "" &&
            validateTokenInput(selectedToken) === "" &&
            validateAmountInput(exchange.transaction.amount, minAmount, maxAmount) === "" &&
            !toApprove

        if (selectedToken.symbol) {

            NTemplate1.symbol =
                exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ?
                    selectedToken.symbol :
                    `Secret ${selectedToken.symbol}`

            NTemplate2.symbol =
                exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ?
                    `Secret ${selectedToken.symbol}` :
                    selectedToken.symbol
        }



        const onClickHandler = async (callback: () => void) => {

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

            if (!userMetamask.isAuthorized && exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT) {
                if (!userMetamask.isAuthorized) {
                    return await userMetamask.signIn(true);
                }
            }

            callback()
        };

        return (
            <Box fill direction="column" background="transparent">
                <Fade left>
                    <Box fill direction="row" justify="around" pad="xlarge" background="#f5f5f5" style={{ position: 'relative' }}>
                        {renderNetworkTemplate(NTemplate1)}
                        <Box pad="small" style={{ position: 'absolute', top: 'Calc(50% - 60px)', left: 'Calc(50% - 60px)' }}>
                            <Icon size="60" glyph="Reverse" onClick={async () => {
                                exchange.transaction.amount = ""
                                exchange.transaction.tokenSelected = { symbol: '', image: '', value: '' }
                                exchange.transaction.erc20Address = ''
                                this.setState({ tokenLocked: false, tokenError: "", amountError: "", addressError: "" })
                                exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ?
                                    exchange.setMode(EXCHANGE_MODE.SCRT_TO_ETH) :
                                    exchange.setMode(EXCHANGE_MODE.ETH_TO_SCRT)
                            }} />
                        </Box>
                        {renderNetworkTemplate(NTemplate2)}
                    </Box>
                </Fade>
                <Fade right>

                    <Box fill direction="column" className={styles.exchangeContainer}>
                        <Form ref={ref => (this.formRef = ref)} data={exchange.transaction} {...({} as any)} >
                            <Box direction="row" fill={true} pad="xlarge">

                                <Box direction="row" gap="2px" width="50%" margin={{ right: 'medium' }}>
                                    <Box width="100%" margin={{ right: 'medium' }} direction="column">
                                        <ERC20Select
                                            value={selectedToken.value}
                                            onSelectToken={async (token, value) => {
                                                token.display_props.symbol === "ETH" ? exchange.setToken(TOKEN.ETH) : exchange.setToken(TOKEN.ERC20)
                                                token.display_props.value = value
                                                exchange.transaction.amount = ""
                                                exchange.transaction.confirmed = false
                                                exchange.transaction.tokenSelected = { ...token.display_props }

                                                if (token.display_props.symbol !== "ETH") exchange.transaction.erc20Address = value

                                                this.setState({ tokenError: "" })
                                                this.setState({ tokenLocked: false })
                                                exchange.checkTokenApprove(value)

                                                if (token.display_props.symbol === 'ETH') return

                                                if (exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
                                                    try {
                                                        await user.updateBalanceForSymbol(token.display_props.symbol);
                                                        const balance = user.balanceToken[token.src_coin]
                                                        console.log('balance', balance);
                                                        this.setState({ tokenLocked: balance === unlockToken })
                                                    } catch (e) {
                                                        this.setState({ tokenError: e.message })
                                                    }
                                                }

                                            }}
                                        />
                                        <Box margin={{ top: 'medium' }} direction="column">
                                            <Text style={{ minHeight: 20 }} color="red">{tokenError}</Text>
                                            {tokenLocked && renderTokenLocked(user)}
                                        </Box>
                                    </Box>
                                    <Box direction="column" width="100%">

                                        <Text bold size="large">Amount</Text>
                                        <Box direction="row" style={{ height: 46, borderRadius: 4, border: "solid 1px #E7ECF7", marginTop: 8 }} fill justify="between" align="center">
                                            <Box width="40%" style={{ flex: 1 }}>
                                                <NumberInput
                                                    name="amount"
                                                    type="decimal"
                                                    precision="6"
                                                    delimiter="."
                                                    placeholder="0"
                                                    margin={{ bottom: "none" }}
                                                    value={exchange.transaction.amount}
                                                    style={{ borderColor: 'transparent', height: 44 }}
                                                    onChange={async (value) => {
                                                        exchange.transaction.amount = value
                                                        const error = validateAmountInput(value, minAmount, maxAmount)
                                                        this.setState({ amountError: error })
                                                    }}
                                                />
                                            </Box>

                                            <Box direction="row" align="center" justify="end">
                                                {maxAmount === "loading" ?
                                                    <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />
                                                    : <Text bold className={styles.maxAmountInput}>{`/ ${maxAmount}`}</Text>}
                                                <Button
                                                    margin={{ left: 'xsmall', right: 'xsmall' }}
                                                    bgColor="#DEDEDE"
                                                    pad="xxsmall"
                                                    onClick={() => {
                                                        const value = maxAmount
                                                        exchange.transaction.amount = value
                                                        const error = validateAmountInput(value, minAmount, maxAmount)
                                                        this.setState({ amountError: error })
                                                    }}
                                                >
                                                    <Text size="xxsmall" bold>MAX</Text>
                                                </Button>
                                            </Box>
                                        </Box>
                                        <Box margin={{ top: 'xxsmall' }} direction="row" align="center">
                                            <Text bold size="small" color="#00ADE8" margin={{ right: 'xxsmall' }}>Minimum:</Text>
                                            {minAmount === 'loading' ? <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" /> :
                                                <Text size="small" color="#748695">
                                                    {`
                                                    ${minAmount} 
                                                    ${exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH && exchange.token === TOKEN.ERC20 ? 'secret' : ''} 
                                                    ${selectedToken.symbol}
                                                    `}
                                                </Text>
                                            }

                                        </Box>

                                        <Box margin={{ top: 'medium' }} direction="column">
                                            <Text style={{ minHeight: 20 }} color="red">{amountError}</Text>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box width="50%" direction="column" style={{ position: 'relative' }}>
                                    {((exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH && userMetamask.isAuthorized) ||
                                        (exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT && user.isAuthorized)) &&
                                        <Box
                                            style={{
                                                fontWeight: 'bold',
                                                right: 0,
                                                top: 0,
                                                position: 'absolute',
                                                color: 'rgb(0, 173, 232)',
                                                textAlign: 'right'
                                            }}
                                            onClick={() => {
                                                if (exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH) exchange.transaction.ethAddress = userMetamask.ethAddress
                                                if (exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT) exchange.transaction.scrtAddress = user.address
                                            }}
                                        >
                                            Use my address
                                    </Box>
                                    }

                                    <Input
                                        label={exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH ? "Destination ETH Address" : "Destination Secret Address"}
                                        name={exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH ? "ethAddress" : "scrtAddress"}
                                        style={{ width: '100%' }}
                                        margin={{ bottom: 'none' }}
                                        placeholder="Receiver address"
                                        value={exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH ? exchange.transaction.ethAddress : exchange.transaction.scrtAddress}
                                        onChange={(value) => {
                                            if (exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH) exchange.transaction.ethAddress = value
                                            if (exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT) exchange.transaction.scrtAddress = value
                                            const error = validateAddressInput(exchange)
                                            this.setState({ amountError: error })
                                        }}
                                    />
                                    <Box margin={{ top: 'medium' }} direction="column">
                                        <Text style={{ minHeight: 20 }} color="red">{addressError}</Text>
                                    </Box>
                                </Box>

                            </Box>

                        </Form>


                        <Box direction="row" pad="large" justify="end" align="center">

                            {exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT && selectedToken.symbol !== "" && selectedToken.symbol !== "ETH" && <Button
                                disabled={!toApprove}
                                bgColor={"#00ADE8"}
                                color={"white"}
                                style={{ minWidth: 180, height: 48 }}
                                onClick={() => {

                                    const tokenError = validateTokenInput(selectedToken)
                                    this.setState({ tokenError: "", amountError: "" })
                                    if (tokenError) return this.setState({ tokenError })
                                    if (exchange.step.id === EXCHANGE_STEPS.BASE) onClickHandler(exchange.step.onClickApprove);
                                }}
                            >
                                {exchange.tokenApprovedLoading ?
                                    <Loader type="ThreeDots" color="#00BFFF" height="15px" width="2em" /> :
                                    (exchange.isTokenApproved ? 'Approved!' : 'Approve')}
                            </Button>}

                            <Button
                                disabled={!readyToSend}
                                margin={{ left: 'medium' }}
                                bgColor={!toApprove ? "#00ADE8" : "#E4E4E4"}
                                color={!toApprove ? "white" : "#748695"}
                                style={{ minWidth: 300, height: 48 }}
                                onClick={() => {

                                    const tokenError = validateTokenInput(selectedToken)
                                    const amountError = validateAmountInput(exchange.transaction.amount, minAmount, maxAmount)
                                    const addressError = validateAddressInput(exchange)
                                    this.setState({ tokenError: "", amountError: "", addressError: "" })
                                    if (tokenError) return this.setState({ tokenError })
                                    if (amountError) return this.setState({ amountError })
                                    if (addressError) return this.setState({ addressError })

                                    if (exchange.step.id === EXCHANGE_STEPS.BASE) onClickHandler(exchange.step.onClickSend);

                                }}
                            >
                                {exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? "Send to Secret Network" : "Send to Ethereum Blockchain"}
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Box>
        )
    }
}