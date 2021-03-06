import * as React from 'react';
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

export const CheckTransaction = observer(() => {

    const { exchange } = useStores();

    const swap = exchange.operation.swap || { dst_address: '', src_tx_hash: '', dst_tx_hash: '', amount: '' }
    let status = 'Pending'
    switch (exchange.operation.status) {
        case SwapStatus.SWAP_UNSIGNED: status = 'Unsigned'; break
        case SwapStatus.SWAP_SIGNED: status = 'Signed'; break
        case SwapStatus.SWAP_SUBMITTED: status = 'Submitted'; break
        case SwapStatus.SWAP_CONFIRMED: status = 'Finished!'; break
        case SwapStatus.SWAP_FAILED: status = 'Failed'; break
        case SwapStatus.SWAP_RETRY: status = 'Retry'; break
        case SwapStatus.SWAP_WAIT_SEND: status = 'Waiting to be send'; break
        case SwapStatus.SWAP_WAIT_APPROVE: status = 'Waiting for approval'; break
        case SwapStatus.SWAP_SENT: status = 'Sent'; break
        default: status = 'Pending';
    }

    let progress = 0
    if (exchange.operation.status <= 4) progress = (exchange.operation.status / 4) * 100

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
                        <Box style={{ height: 25 }} direction="row" align="center" margin={{ top: 'large' }}>
                            <Text >
                                Your transaction is <b style={{ color: color }}>{status}</b>
                            </Text>
                        </Box>

                        <Box direction='column' fill margin={{ top: 'xsmall' }}>
                            <ProgressBar bgcolor={color} completed={progress} isLabelVisible={false} />
                        </Box>

                        <Text margin={{ top: 'medium' }}><b>Confirmations:</b> {exchange.confirmations}</Text>

                        <Text size="small" color="#748695" margin={{ top: 'xxsmall', bottom: 'medium' }}>
                            Its save to assume that once we have <b>6 network confirmations</b> the tokens arrived to your wallet.
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

                        {exchange.operation.transactionHash && <Box margin={{ top: 'xxsmall' }}><CopyRow
                            label="Ethereum Hash"
                            value={truncateAddressString(exchange.operation.transactionHash, 10)}
                            rawValue={exchange.operation.transactionHash}
                        /></Box>}

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