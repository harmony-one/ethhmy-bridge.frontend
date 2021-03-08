import * as React from 'react';
import { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Icon, Text, Title } from 'components/Base';
import { Modal } from 'semantic-ui-react';
import { Box } from 'grommet';
import { IStores } from 'stores';
import * as styles from '../styles.styl';
import { EXCHANGE_MODE } from 'stores/interfaces';
import { MobxForm } from 'components/Form';
import { EXCHANGE_STEPS } from '../../../stores/Exchange';
import Loader from 'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import { Price } from '../../Explorer/Components';
import { formatWithSixDecimals, truncateAddressString, unlockToken } from 'utils';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useStores } from '../../../stores';
import { TokenLocked } from '../utils';
import HeadShake from 'react-reveal/HeadShake';
import Jump from 'react-reveal/Jump';

type NetworkTemplateInterface = {
    image: string
    symbol: string
    amount: string;
}

const renderNetworkTemplate = (template: NetworkTemplateInterface, justify: any) => (
    <Box justify={justify} fill pad="xsmall" direction="row" align="center" style={{ borderRadius: 10, backgroundColor: "#c3ecdb", height: 44 }}>
        {template.image && <img src={template.image} style={{ width: 20, marginRight: 10 }} alt={template.symbol} />}
        {template.symbol && <Text bold color="#30303D" size="small">{formatWithSixDecimals(template.amount)}</Text>}
        <Text bold margin={{ left: 'xxsmall' }} color="#748695" size="small">{template.symbol}</Text>
    </Box>
)

export const SwapConfirmation = observer(() => {

    const { exchange, user } = useStores();
    const [hash, setHash] = useState<string>(null);
    const [calculated, setCalculated] = useState<string>(null);
    const [isTokenLocked, setTokenLocked] = useState<boolean>(false);

    const symbol = exchange.transaction.tokenSelected.symbol
    const tokenImage = exchange.transaction.tokenSelected.image
    const amount = exchange.transaction.amount

    useEffect(() => {
        exchange.transaction.error = ''
        try {
            console.log('fetching')
            user.updateBalanceForSymbol(exchange.transaction.tokenSelected.symbol).then(() => {

                const balance = user.balanceToken[exchange.transaction.tokenSelected.src_coin]
                console.log('fetched', balance)

                setTokenLocked(balance === unlockToken)
            })

        } catch (e) { }
    }, []);

    useEffect(() => {
        if (exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT) {
            setHash(`${process.env.ETH_EXPLORER_URL}/tx/${exchange.txHash}`)
        }

        if (exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
            setHash(`${process.env.SCRT_EXPLORER_URL}/transactions/${exchange.txHash}`)
        }
    }, [exchange.txHash]);

    useEffect(() => {
        let calculatedAmount = formatWithSixDecimals(Number(exchange.transaction.amount) - Number(exchange.swapFeeToken))
        if (Number(calculatedAmount) < 0) {
            calculatedAmount = "0"
        }
        setCalculated(calculatedAmount)

    }, [exchange.transaction.amount, exchange.swapFeeToken]);

    const NTemplate1: NetworkTemplateInterface = {
        symbol: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? symbol : `Secret ${symbol}`,
        amount,
        image: tokenImage

    }

    const NTemplate2: NetworkTemplateInterface = {
        symbol: exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? `Secret ${symbol}` : symbol,
        amount,
        image: tokenImage

    }


    return (

        <Modal
            onClose={() => exchange.stepNumber = EXCHANGE_STEPS.BASE}
            open={exchange.step.modal}
            style={{ width: '600px', display: 'flex' }}
        >

            <React.Fragment>
                <Modal.Header>
                    <div style={{ padding: "12 32", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title bold>Confirm Transaction!</Title>
                        <span style={{ cursor: 'pointer' }} onClick={() => exchange.stepNumber = EXCHANGE_STEPS.BASE}>
                            <Icon size="23" glyph="Close" />
                        </span>
                    </div>
                </Modal.Header>
                <Modal.Content>
                    <Box direction="column" fill={true} pad="large">

                        <Box direction="row" fill={true} justify="between" align="center" style={{ marginBottom: 26 }}>
                            {renderNetworkTemplate(NTemplate1, "center")}
                            <Box style={{ margin: '0 15' }}>
                                <Icon size="60" glyph="Right" />
                            </Box>
                            {renderNetworkTemplate(NTemplate2, "center")}
                        </Box>


                        <Text size="small" color="#748695" margin={{ top: 'xsmall', bottom: 'medium' }}>
                            You are about to bridge <b>{amount} {symbol}</b> to <b>{exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? 'Secret Network' : 'Ethereum'}</b>, please be patient as the transaction may take a few minutes. You can follow each step of the transaction here once you confirm it!
                            </Text>

                        <Box direction="column">
                            <Box direction="row" justify="between">
                                <Text>Secret Address:</Text>
                                <Box direction="row">
                                    <Text size="small" style={{ fontFamily: 'monospace' }}>

                                        {truncateAddressString(exchange.transaction.scrtAddress)}
                                    </Text>
                                    <CopyToClipboard text={exchange.transaction.ethAddress}>
                                        <Icon glyph="PrintFormCopy" size="1em" color="#1c2a5e" style={{ marginLeft: 10, width: 20 }} />
                                    </CopyToClipboard>
                                </Box>
                            </Box>
                            <Box direction="row" margin={{ top: 'small' }} justify="between">
                                <Text>Ethereum Address:</Text>
                                <Box direction="row">
                                    <Text size="small" style={{ fontFamily: 'monospace' }}>
                                        {truncateAddressString(exchange.transaction.ethAddress)}
                                    </Text>
                                    <CopyToClipboard text={exchange.transaction.ethAddress}>
                                        <Icon glyph="PrintFormCopy" size="1em" color="#1c2a5e" style={{ marginLeft: 10, width: 20 }} />
                                    </CopyToClipboard>
                                </Box>
                            </Box>
                            <Box direction="row" margin={{ top: 'small' }} justify="between">
                                <Text>Amount:</Text>
                                <Box direction="row">
                                    <Text bold>{formatWithSixDecimals(exchange.transaction.amount)}</Text>

                                    <img src={exchange.transaction.tokenSelected.image} style={{ marginLeft: 10 }} width="20" height="20" />
                                </Box>
                            </Box>
                        </Box>

                        <Box style={{ height: 40 }} direction="row" justify="between" align="start" margin={{ top: 'large' }}>
                            <Box direction="row" align="center">
                                <img style={{ marginRight: 6, width: exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH ? 15 : 12 }} className={styles.imgToken} src={exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH ? "/static/scrt.svg" : "/static/eth.svg"} />
                                <Text bold size="small" color="#00ADE8" >
                                    {exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH ? 'Secret Network Fee' : 'Ethereum Fee'}
                                </Text>
                            </Box>
                            {exchange.isFeeLoading ? <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" /> : <Price
                                value={exchange.networkFee}
                                isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT}
                                boxProps={{ pad: {} }}
                            />}
                        </Box>

                        {exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH && <Box style={{ height: 40 }} direction="row" justify="between" align="start" margin={{ top: 'xsmall' }}>
                            <Box className={styles.warningSign} direction="row" align="center">
                                <img style={{ marginRight: 6, width: 12 }} src={"/static/eth.svg"} />
                                <Text bold size="small" color="#00ADE8" margin={{ right: 'xxsmall' }}>Ethereum Fee</Text>
                                <img src="/static/warning.svg" width="20" className={styles.image_warning} />
                                <Box pad="xsmall" className={styles.warning_message}>
                                    <Text size="xsmall">You are about to move your secret tokens back to Ethereum. You will receive approximately <b>{calculated} {symbol}</b> and <b>{formatWithSixDecimals(Number(exchange.swapFeeToken))} {symbol}</b> will be used to pay for Ethereum gas fees
                                        </Text>
                                </Box>
                            </Box>
                            {exchange.isFeeLoading ? <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" /> : <Price
                                value={Number(formatWithSixDecimals(exchange.swapFeeToken))}
                                valueUsd={exchange.swapFeeUSD}
                                token={symbol}
                                boxProps={{ pad: {} }}
                            />}
                        </Box>}


                        {exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH && <Box style={{ height: 40 }} direction="row" align="start" margin={{ top: 'xsmall' }} justify="between">
                            <Box direction="row">
                                <img src={exchange.transaction.tokenSelected.image} style={{ marginRight: 6 }} width="15" />

                                <Text bold size="small" color="#00ADE8" margin={{ right: 'xxsmall' }}>You will recieve</Text>
                            </Box>
                            {!calculated ? <Loader type="ThreeDots" color="#00BFFF" height="1em" width="5em" /> :
                                <Text bold size="small" color={calculated === "0" ? '#f37373' : '#212D5E'}>{calculated} {symbol}</Text>}
                        </Box>}

                        {isTokenLocked && exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT && <TokenLocked user={user} onFinish={(value) => setTokenLocked(!value)} />}

                        {exchange.transaction.error && <HeadShake bottom>
                            <Box margin={{ top: 'xsmall' }}>
                                <Text color="red">{exchange.transaction.error}</Text>
                            </Box>
                        </HeadShake>}

                        <Box fill direction="row" align="center" style={{ width: '100%' }} margin={{ top: 'large' }}>
                            {!exchange.transaction.confirmed ? <Button className={styles.fill} style={{ height: 50, width: '100%', background: "#00ADE8", color: "white" }} onClick={() => {
                                if (exchange.transaction.loading) return
                                return exchange.step.onClick()
                            }}>
                                {exchange.transaction.loading ?
                                    <Loader type="ThreeDots" color="#00BFFF" height="1em" width="5em" /> : "Confirm"
                                }

                            </Button> :
                                <Jump><Button className={styles.fill} style={{ height: 50, width: 494, background: "#00ADE8", color: "white" }} onClick={() => {
                                    return exchange.stepNumber = EXCHANGE_STEPS.CHECK_TRANSACTION
                                }}>
                                    Follow Transaction Status
                            </Button></Jump>}
                        </Box>


                    </Box>

                </Modal.Content>
            </React.Fragment>

        </Modal>
    )
})