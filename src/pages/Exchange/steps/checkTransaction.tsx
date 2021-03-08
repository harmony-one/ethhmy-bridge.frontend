import * as React from 'react';
import { useEffect, useState } from 'react';

import { observer } from 'mobx-react';
import { Icon, Text, Title } from 'components/Base';
import { Modal } from 'semantic-ui-react';
import { Box } from 'grommet';
import Loader from 'react-loader-spinner';

import { EXCHANGE_STEPS } from '../../../stores/Exchange';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import { truncateAddressString } from 'utils';
import { useStores } from '../../../stores';
import ProgressBar from "@ramonak/react-progress-bar";
import { SwapStatus } from '../../../constants';
import { CopyRow } from "../utils"
import { EXCHANGE_MODE } from 'stores/interfaces';
import HeadShake from 'react-reveal/HeadShake';

export const CheckTransaction = observer(() => {

    const { exchange } = useStores();
    const [conformationsMessage, setConfirmationsMessage] = useState<string>("");
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [progressBar, setProgressBar] = useState<number>(0);

    useEffect(() => {
        if (exchange.operation.type === EXCHANGE_MODE.SCRT_TO_ETH) {
            setConfirmationsMessage("You will have your Ethereum Tokens in your Metamask wallet within 6 network confirmations")
        } else {
            setConfirmationsMessage("You will have your secretTokens in your Keplr wallet within 6 network confirmations")
        }

    }, [exchange.operation.type]);

    useEffect(() => {
        let status = 'Pending'
        switch (exchange.operation.status) {
            case SwapStatus.SWAP_UNSIGNED: status = 'Unsigned'; break
            case SwapStatus.SWAP_SIGNED:
                status = exchange.operation.type === EXCHANGE_MODE.ETH_TO_SCRT ? 'Being processed on Ethereum' : 'Being processed on Secret Network';
                break
            case SwapStatus.SWAP_SUBMITTED:
                status = exchange.operation.type === EXCHANGE_MODE.ETH_TO_SCRT ?
                    `Confirmed on Ethereum and it's being process on Secret Network` :
                    `Confirmed on Secret Network and it's being process on Ethereum`;
                break
            case SwapStatus.SWAP_CONFIRMED: status = 'Completed!'; break
            case SwapStatus.SWAP_FAILED: status = 'Failed'; break
            case SwapStatus.SWAP_RETRY: status = 'Retry'; break
            case SwapStatus.SWAP_WAIT_SEND: status = 'Waiting to be sent'; break
            case SwapStatus.SWAP_WAIT_APPROVE: status = 'Waiting for approval'; break
            case SwapStatus.SWAP_SENT: status = 'Sent'; break
            default: status = 'Pending';
        }
        setStatusMessage(status)
        let progress = 0

        if (exchange.operation.status <= 4) progress = (exchange.operation.status / 4) * 100
        setProgressBar(progress)

    }, [exchange.operation.status, exchange.operation.type]);

    const swap = exchange.operation.swap || { dst_address: '', src_tx_hash: '', dst_tx_hash: '', amount: '' }

    let color = "#00BFFF"
    if (exchange.operation.status === SwapStatus.SWAP_CONFIRMED) color = "#65d180"
    return (

        <Modal
            onClose={() => exchange.stepNumber = EXCHANGE_STEPS.BASE}
            open={exchange.step.modal}
            style={{ width: '600px', display: 'flex' }}
        >

            <React.Fragment>
                <Modal.Header>
                    <div style={{ padding: "12 32", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title bold>Follow your Transaction!</Title>
                        <span style={{ cursor: 'pointer' }} onClick={() => exchange.stepNumber = EXCHANGE_STEPS.BASE}>
                            <Icon size="23" glyph="Close" />
                        </span>
                    </div>
                </Modal.Header>
                <Modal.Content>
                    <Box direction="column" fill={true} pad="large">
                        <Box fill align="center" justify="center" style={{ minHeight: 180 }}>
                            {exchange.operation.status === SwapStatus.SWAP_CONFIRMED ?
                                <Icon size="180" glyph="Check2" /> :
                                <Loader type="Circles" color="#00BFFF" height="180px" width="180px" style={{ margin: '0 10' }} />}
                        </Box>
                        <Box style={{ height: 25 }} direction="row" align="center" margin={{ top: 'large', bottom: 'xxsmall' }}>
                            <Text >
                                Your transaction is <b style={{ color: color }}>{statusMessage}</b>
                            </Text>
                        </Box>

                        <Box direction='column' fill margin={{ top: 'xsmall' }}>
                            <ProgressBar bgcolor={color} completed={progressBar} isLabelVisible={false} />
                        </Box>

                        <Text margin={{ top: 'medium' }}><b>Confirmations:</b> {exchange.confirmations}</Text>

                        <Text size="small" color="#748695" margin={{ top: 'xxsmall', bottom: 'medium' }}>
                            {conformationsMessage}
                        </Text>

                        {swap.amount && <Box direction="row" justify="between">
                            <Text size="small" bold>Amount</Text>
                            <Box direction="row" align="center">
                                <Text bold margin={{ right: 'xsmall' }}>{swap.amount} {exchange.operation.symbol}</Text>
                                <img alt="exchange.operation.symbol" src={exchange.operation.image} width="17" />
                            </Box>

                        </Box>}

                        {swap.dst_address && <Box margin={{ top: 'xxsmall' }}><CopyRow
                            label="Destination Address"
                            value={truncateAddressString(swap.dst_address, 10)}
                            rawValue={swap.dst_address}
                        /></Box>}


                        {exchange.operation.transactionHash && <HeadShake><Box direction="row" justify="between" margin={{ top: 'xxsmall' }}>
                            <Text size="small" bold> <a
                                href={`${process.env.ETH_EXPLORER_URL}/tx/${exchange.operation.transactionHash}`}
                                style={{ textDecoration: 'none', color: "#00BFFF" }}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View on Etherscan
                            </a>
                            </Text>
                        </Box></HeadShake>}

                        {exchange.transaction.error && <HeadShake><Box margin={{ top: 'xxsmall' }}>
                            <Text size="small" color="#f37373">
                                {exchange.transaction.error}
                            </Text>
                        </Box></HeadShake>}


                        {exchange.operation && <Box margin={{ top: 'medium' }}><CopyRow
                            label="Operation ID"
                            value={truncateAddressString(exchange.operation.id, 15)}
                            rawValue={exchange.operation.id}
                        /></Box>}
                    </Box>

                </Modal.Content>
            </React.Fragment>

        </Modal>
    )
})