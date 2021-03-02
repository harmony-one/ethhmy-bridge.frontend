import * as React from 'react';
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
import { formatWithSixDecimals, truncateAddressString } from 'utils';
import { CopyToClipboard } from 'react-copy-to-clipboard';

type NetworkTemplateInterface = {
    image: string
    symbol: string
    amount: string;
}

const renderNetworkTemplate = (template: NetworkTemplateInterface, justify: any) => (
    <Box justify={justify} fill pad="xsmall" direction="row" align="center" style={{ borderRadius: 10, backgroundColor: "#c3ecdb", height: 44 }}>
        {template.image && <img src={template.image} style={{ width: 20, marginRight: 10 }} alt={template.symbol} />}
        {template.symbol && <Text bold color="#30303D" size="small">{template.amount}</Text>}
        <Text bold margin={{ left: 'xxsmall' }} color="#748695" size="small">{template.symbol}</Text>
    </Box>
)

@inject('user', 'exchange', 'actionModals', 'userMetamask', 'routing')
@observer
export class SwapConfirmation extends React.Component<
Pick<IStores, 'user'> &
Pick<IStores, 'exchange'> &
Pick<IStores, 'routing'> &
Pick<IStores, 'actionModals'> &
Pick<IStores, 'tokens'> &
Pick<IStores, 'userMetamask'>
> {
    formRef: MobxForm;

    constructor(props) {
        super(props);

    }


    render() {

        const { exchange, routing } = this.props;

        const symbol = exchange.transaction.tokenSelected.symbol
        const tokenImage = exchange.transaction.tokenSelected.image
        const amount = exchange.transaction.amount

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

        let hashLink = ''
        if (exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT) {
            hashLink = `${process.env.ETH_EXPLORER_URL}/tx/${exchange.txHash}`
        }

        if (exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH) {
            hashLink = `${process.env.SCRT_EXPLORER_URL}/transactions/${exchange.txHash}`
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
                                <img alt="bridge" src="/static/bridge.svg" width="40" height="30" style={{ margin: '0 15' }} />
                                {renderNetworkTemplate(NTemplate2, "center")}
                            </Box>


                            <Text size="small" color="#748695" margin={{ top: 'xsmall', bottom: 'medium' }}>
                                You are about to bridge <b>{amount} {symbol}</b> to <b>{exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? 'Secret Network' : 'Ethereum Blockchain'}</b>, please be patient as the transaction may take a few minutes. You can follow it every step of the way right here once you confirm the transaction!
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
                                        <Text>{formatWithSixDecimals(exchange.transaction.amount)}</Text>

                                        <img src={exchange.transaction.tokenSelected.image} style={{ marginLeft: 10 }} width="20" height="20" />
                                    </Box>
                                </Box>
                            </Box>

                            <Box style={{ height: 40 }} direction="row" justify="between" align="start" margin={{ top: 'large' }}>
                                <Text bold size="small" color="#00ADE8" >Fee</Text>
                                {exchange.isFeeLoading ? <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" /> : <Price
                                    value={exchange.networkFee}
                                    isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT}
                                    boxProps={{ pad: {} }}
                                />}
                            </Box>

                            <Box style={{ height: 25 }}>
                                {exchange.txHash && <Text>Follow Transaction <a href={hashLink}
                                    style={{ textDecoration: 'none' }}
                                    target="_blank"
                                    rel="noreferrer">Here</a></Text>}
                            </Box>

                            <Box fill direction="row" align="center" style={{ width: '100%' }} margin={{ top: 'large' }}>
                                <Button className={styles.fill} style={{ height: 50, width: '100%', background: "#00ADE8", color: "white" }} onClick={() => {
                                    if (exchange.transaction.loading) return
                                    if (exchange.transaction.confirmed) return routing.push('/earn') //TODO: chnage to portfolio
                                    return exchange.step.onClick()
                                }}>
                                    {exchange.transaction.loading ?
                                        <Loader type="ThreeDots" color="#00BFFF" height="1em" width="5em" /> :
                                        (exchange.transaction.confirmed ? <span><b>Bridged.</b> Check Your Portfolio</span> : "Confirm")

                                    }

                                </Button>
                            </Box>


                        </Box>

                    </Modal.Content>
                </React.Fragment>
            </Modal>
        )
    }
}