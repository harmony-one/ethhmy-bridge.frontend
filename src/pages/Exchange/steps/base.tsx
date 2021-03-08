import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Icon, Text, Title } from 'components/Base';
import * as styles from '../styles.styl';
import { Box } from 'grommet';
import Web3 from 'web3';
import * as bech32 from 'bech32';
import { IStores } from 'stores';
import { useEffect, useState } from 'react';
import { errorTypes, unlockToken } from 'utils';
import { EXCHANGE_MODE, TOKEN } from 'stores/interfaces';
import { Form, Input, NumberInput, MobxForm } from 'components/Form';
import { ERC20Select } from '../ERC20Select';
import { AuthWarning } from '../../../components/AuthWarning';
import { EXCHANGE_STEPS } from '../../../stores/Exchange';
import Loader from 'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import Fade from 'react-reveal/Fade';
import HeadShake from 'react-reveal/HeadShake';
import Flip from 'react-reveal/Flip';
import { TokenLocked, NetworkTemplate, NetworkTemplateInterface, ViewingKeyIcon } from '../utils';
import { ISignerHealth } from '../../../stores/interfaces';
import { useStores } from '../../../stores';
interface Errors {
    amount: string;
    token: any;
    address: string;
}

type BalanceAmountInterface = {
    minAmount: string,
    maxAmount: string,
}

type BalanceInterface = {
    eth: BalanceAmountInterface,
    scrt: BalanceAmountInterface
}

const validateTokenInput = (token: any) => {
    if (!token || !token.symbol) return 'This field is required.'
    return ""
}


const validateAmountInput = (value: string, minAmount: any, maxAmount: any) => {
    if (!value || !value.trim() || Number(value) <= 0) return 'This field is required.'
    if (Number(value) > Number(maxAmount) || !Number(maxAmount)) return 'Exceeded the maximum amount.'
    if (Number(value) < Number(minAmount)) return 'Below the minimum amount.'

    return ""
}


const validateAddressInput = (mode: EXCHANGE_MODE, value: string) => {
    if (!value) return 'Field required.'
    if (mode === EXCHANGE_MODE.SCRT_TO_ETH) {
        const web3 = new Web3();
        if (!web3.utils.isAddress(value) || !web3.utils.checkAddressChecksum(value)) return 'Not a valid Ethereum Address.'
    }
    if (mode === EXCHANGE_MODE.ETH_TO_SCRT) {
        if (!value.startsWith('secret')) return 'Not a valid Secret Address.'

        try {
            bech32.decode(value);
        } catch (error) {
            return 'Not a valid Secret Address.'
        }
    }
    return ""
}

const getBalance = (exchange, userMetamask, user, isLocked) => {
    const eth = { minAmount: '0', maxAmount: '0' }
    const scrt = { minAmount: '0', maxAmount: '0' }

    const src_coin = exchange.transaction.tokenSelected.src_coin

    if (exchange.token === TOKEN.ERC20) {
        if (!userMetamask.erc20TokenDetails) {
            eth.maxAmount = "0"
            eth.minAmount = "0"
        }
        scrt.maxAmount = user.balanceToken[src_coin] ? user.balanceToken[src_coin] : '0'
        scrt.minAmount = user.snip20BalanceMin || '0'
        eth.maxAmount = userMetamask.erc20Balance
        eth.minAmount = userMetamask.erc20BalanceMin || '0'
    } else {
        scrt.maxAmount =
            (!user.balanceToken['Ethereum'] || user.balanceToken['Ethereum'].includes(unlockToken)) ? '0' : user.balanceToken['Ethereum']
        scrt.minAmount = user.balanceTokenMin['Ethereum'] || '0'
        eth.maxAmount = exchange.transaction.tokenSelected.symbol === "ETH" ? userMetamask.ethBalance : "0"
        eth.minAmount = exchange.transaction.tokenSelected.symbol === "ETH" ? (userMetamask.ethBalanceMin || "0") : "0"
    }

    if (isLocked) {
        scrt.maxAmount = unlockToken
    }

    return { eth, scrt }

}

export const Base = observer(() => {
    const { user, userMetamask, actionModals, exchange, tokens } = useStores();
    const [errors, setErrors] = useState<Errors>({ token: "", address: "", amount: "" });
    const [selectedToken, setSelectedToken] = useState<any>({});
    const [networkTemplates, setNetworkTemplates] = useState<Array<NetworkTemplateInterface>>([{
        name: "Ethereum",
        wallet: "Metamask",
        symbol: "Select a token",
        amount: "",
        image: "",
        health: true
    }, {
        name: "Secret Network",
        wallet: "Keplr",
        symbol: "Select a token",
        amount: "",
        image: "",
        health: true
    }]);
    const [isTokenLocked, setTokenLocked] = useState<boolean>(false);
    const [minAmount, setMinAmount] = useState<string>("");
    const [maxAmount, setMaxAmount] = useState<string>("");

    const defaultBalance: BalanceInterface = { eth: { minAmount: '', maxAmount: '' }, scrt: { minAmount: '', maxAmount: '' } }
    const [balance, setBalance] = useState<BalanceInterface>(defaultBalance);
    const [onSwap, setSwap] = useState<boolean>(false);
    const [toApprove, setToApprove] = useState<boolean>(false);
    const [readyToSend, setReadyToSend] = useState<boolean>(false);
    const [toSecretHealth, setToSecretHealth] = useState<boolean>(true);
    const [fromSecretHealth, setFromSecretHealth] = useState<boolean>(true);

    const { signerHealth } = useStores();


    useEffect(() => {
        const signers: ISignerHealth[] = signerHealth.allData;

        if (signers.length === 0) {
            return;
        }

        const parseHealth = (signers: ISignerHealth[]): boolean => {
            for (const signer of signers) {
                if (signer.signer === process.env.LEADER_ACCOUNT && signers.length >= Number(process.env.SIG_THRESHOLD)) {
                    return true;
                }
            }
            return false;
        };

        setFromSecretHealth(parseHealth(signers.filter(s => s.from_scrt)))
        setToSecretHealth(parseHealth(signers.filter(s => s.to_scrt)))

    }, [signerHealth.allData]);

    useEffect(() => {
        setSelectedToken(exchange.transaction.tokenSelected)
    }, [exchange.transaction.tokenSelected]);

    useEffect(() => {
        const fromNetwork = exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? 'eth' : 'scrt'
        setMinAmount(balance[fromNetwork].minAmount)
        setMaxAmount(balance[fromNetwork].maxAmount)
    }, [exchange.mode, balance]);

    useEffect(() => {
        if (exchange.step.id === EXCHANGE_STEPS.BASE && exchange.transaction.tokenSelected.value) {
            onSelectedToken(exchange.transaction.tokenSelected.value)
        }

    }, [exchange.step.id]);

    useEffect(() => {
        const NTemplate1: NetworkTemplateInterface = {
            name: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? "Ethereum" : "Secret Network",
            wallet: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? "Metamask" : "Keplr",
            symbol: selectedToken.symbol,
            amount: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? balance.eth.maxAmount : balance.scrt.maxAmount,
            image: selectedToken.image,
            health: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? toSecretHealth : fromSecretHealth,

        }

        const NTemplate2: NetworkTemplateInterface = {
            name: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? "Secret Network" : "Ethereum",
            wallet: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? "Keplr" : "Metamask",
            symbol: selectedToken.symbol,
            amount: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? balance.scrt.maxAmount : balance.eth.maxAmount,
            image: selectedToken.image,
            health: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? fromSecretHealth : toSecretHealth,
        }

        if (selectedToken.symbol) {
            NTemplate1.symbol = exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? selectedToken.symbol : `Secret ${selectedToken.symbol}`
            NTemplate2.symbol = exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? `Secret ${selectedToken.symbol}` : selectedToken.symbol
        }

        setNetworkTemplates([NTemplate1, NTemplate2])
    }, [exchange.mode, selectedToken, balance, toSecretHealth, fromSecretHealth]);

    useEffect(() => {
        setToApprove(
            exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT &&
            !exchange.isTokenApproved &&
            exchange.transaction.erc20Address !== "" &&
            selectedToken.symbol !== "ETH"
        )
    }, [selectedToken, exchange.mode, exchange.isTokenApproved, exchange.transaction.erc20Address]);



    useEffect(() => {
        const address = exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH ? exchange.transaction.ethAddress : exchange.transaction.scrtAddress
        const value = errors.token === "" &&
            errors.amount === "" &&
            errors.address === "" &&
            exchange.transaction.amount !== "" &&
            selectedToken !== "" &&
            address !== "" &&
            !toApprove

        setReadyToSend(value)
    }, [
        toApprove,
        errors,
        exchange.transaction.amount,
        selectedToken,
        exchange.mode,
        exchange.transaction.ethAddress,
        exchange.transaction.scrtAddress
    ]);


    const onSelectedToken = async (value) => {
        const token = tokens.allData.find(t => t.src_address === value)
        setBalance({ eth: { minAmount: 'loading', maxAmount: 'loading' }, scrt: { minAmount: 'loading', maxAmount: 'loading' } })
        token.display_props.symbol === "ETH" ? exchange.setToken(TOKEN.ETH) : exchange.setToken(TOKEN.ERC20)
        if (token.display_props.symbol === "ETH") user.snip20Address = token.dst_address
        if (token.display_props.symbol !== exchange.transaction.tokenSelected.symbol) exchange.transaction.amount = ""
        exchange.transaction.confirmed = false
        exchange.transaction.tokenSelected = {
            symbol: token.display_props.symbol,
            value: value,
            image: token.display_props.image,
            src_coin: token.src_coin,
        }

        if (token.display_props.symbol !== "ETH") {
            exchange.transaction.erc20Address = value
            exchange.checkTokenApprove(value)

        }

        setErrors({ ...errors, token: "" })
        setTokenLocked(false)

        try {
            if (token.display_props.symbol !== "ETH") await userMetamask.setToken(value, tokens);
        } catch (e) {
            console.log(e)
        }



        try {
            await user.updateBalanceForSymbol(token.display_props.symbol);

        } catch (e) {
            setErrors({ ...errors, token: e.message })
        }
        const amount = user.balanceToken[token.src_coin]
        const isLocked = amount === unlockToken
        const balance = getBalance(exchange, userMetamask, user, isLocked)

        setBalance(balance)
        setTokenLocked(amount === unlockToken)
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
                    <NetworkTemplate template={networkTemplates[0]} onSwap={onSwap} user={user} />
                    <Box style={{ padding: '0 16', position: 'absolute', top: 'Calc(50% - 60px)', left: 'Calc(50% - 60px)' }}>
                        <Icon size="60" glyph="Reverse" onClick={async () => {
                            exchange.transaction.amount = ""
                            setErrors({ token: "", address: "", amount: "" })
                            setSwap(!onSwap)

                            exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ?
                                exchange.setMode(EXCHANGE_MODE.SCRT_TO_ETH) :
                                exchange.setMode(EXCHANGE_MODE.ETH_TO_SCRT)
                        }} />
                    </Box>
                    <NetworkTemplate template={networkTemplates[1]} onSwap={onSwap} user={user} />
                </Box>
            </Fade>
            <Fade right>
                <Flip bottom spy={onSwap} duration={1000}>
                    <Box fill direction="column" className={styles.exchangeContainer}>
                        <Form data={exchange.transaction} {...({} as any)} >
                            <Box direction="row" fill={true} pad="xlarge">

                                <Box direction="row" gap="2px" width="50%" margin={{ right: 'medium' }}>
                                    <Box width="100%" margin={{ right: 'medium' }} direction="column">
                                        <ERC20Select
                                            value={selectedToken.value}
                                            onSelectToken={onSelectedToken}
                                        />
                                        <Box style={{ minHeight: 20 }} margin={{ top: 'medium' }} direction="column">
                                            {errors.token && <HeadShake>
                                                <Text color="red">{errors.token}</Text>
                                            </HeadShake>}
                                        </Box>
                                    </Box>
                                    <Box direction="column" width="100%">

                                        <Text bold size="large">Amount</Text>
                                        <Box direction="row" style={{ height: 46, borderRadius: 4, border: "solid 1px #E7ECF7", marginTop: 8 }} fill justify="between" align="center">
                                            <Box width="40%" style={{ flex: 1 }}>
                                                <NumberInput
                                                    name="amount"
                                                    type="decimal"
                                                    precision="18"
                                                    delimiter="."
                                                    placeholder="0"
                                                    margin={{ bottom: "none" }}
                                                    value={exchange.transaction.amount}
                                                    style={{ borderColor: 'transparent', height: 44 }}
                                                    onChange={async (value) => {
                                                        exchange.transaction.amount = value
                                                        const error = validateAmountInput(value, minAmount, maxAmount)
                                                        setErrors({ ...errors, amount: error })
                                                    }}
                                                />
                                            </Box>

                                            <Box direction="row" align="center" justify="end">
                                                <Box className={styles.maxAmountInput} direction="row">
                                                    <Text bold margin={{ right: 'xxsmall' }}>/</Text>
                                                    {maxAmount === "loading" ?
                                                        <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />
                                                        : maxAmount === unlockToken ? <ViewingKeyIcon user={user} /> :
                                                            <Text bold className={styles.maxAmountInput}>{maxAmount}</Text>}
                                                </Box>

                                                <Button
                                                    margin={{ left: 'xsmall', right: 'xsmall' }}
                                                    bgColor="#DEDEDE"
                                                    pad="xxsmall"
                                                    onClick={() => {
                                                        if (maxAmount === unlockToken) return
                                                        if (validateAmountInput(maxAmount, minAmount, maxAmount)) return
                                                        const value = maxAmount
                                                        exchange.transaction.amount = value
                                                    }}
                                                >
                                                    <Text size="xxsmall" bold>MAX</Text>
                                                </Button>
                                            </Box>
                                        </Box>
                                        <Box margin={{ top: 'xxsmall' }} direction="row" align="center" justify="between">
                                            <Box direction="row">
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
                                            {exchange.transaction.tokenSelected.value && <Box margin={{ right: 'xxsmall' }}><Icon size="15" glyph="Refresh" onClick={async () => {
                                                onSelectedToken(exchange.transaction.tokenSelected.value)
                                            }} /></Box>}

                                        </Box>

                                        <Box style={{ minHeight: 38 }} margin={{ top: 'medium' }} direction="column">
                                            {errors.amount && <HeadShake bottom>
                                                <Text color="red">{errors.amount}</Text>
                                            </HeadShake>}

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
                                                if (exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
                                                    exchange.transaction.ethAddress = userMetamask.ethAddress
                                                    setErrors({ ...errors, address: validateAddressInput(exchange.mode, userMetamask.ethAddress) })
                                                } else {
                                                    exchange.transaction.scrtAddress = user.address
                                                    setErrors({ ...errors, address: validateAddressInput(exchange.mode, user.address) })
                                                }
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
                                            const error = validateAddressInput(exchange.mode, value)
                                            setErrors({ ...errors, address: error })
                                        }}
                                    />
                                    <Box style={{ minHeight: 20 }} margin={{ top: 'medium' }} direction="column">
                                        {errors.address && <HeadShake>
                                            <Text color="red">{errors.address}</Text>
                                        </HeadShake>}
                                    </Box>
                                </Box>

                            </Box>

                        </Form>


                        <Box direction="row" style={{ padding: '0 32 24 32', height: 120 }} justify="between" align="end">
                            <Box style={{ maxWidth: '50%' }}>
                                {isTokenLocked && <TokenLocked user={user} onFinish={(value) => {
                                    setTokenLocked(!value)
                                    onSelectedToken(exchange.transaction.tokenSelected.value)

                                }} />}
                            </Box>
                            <Box direction="row">

                                {exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT && selectedToken.symbol !== "" && selectedToken.symbol !== "ETH" && <Button
                                    disabled={exchange.tokenApprovedLoading || !toApprove}
                                    bgColor={"#00ADE8"}
                                    color={"white"}
                                    style={{ minWidth: 180, height: 48 }}
                                    onClick={() => {
                                        const tokenError = validateTokenInput(selectedToken)
                                        setErrors({ ...errors, token: "" })
                                        if (tokenError) return setErrors({ ...errors, token: tokenError })

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
                                        if (exchange.step.id === EXCHANGE_STEPS.BASE) onClickHandler(exchange.step.onClickSend);
                                    }}
                                >
                                    {exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? "Bridge to Secret Network" : "Bridge to Ethereum"}
                                </Button>

                            </Box>

                        </Box>
                    </Box>
                </Flip>
            </Fade>
        </Box>
    )
})
