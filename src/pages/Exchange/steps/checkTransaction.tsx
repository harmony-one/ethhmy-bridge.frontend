import * as React from 'react';
import { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Icon, Text, Title } from 'components/Base';
import { Modal } from 'semantic-ui-react';
import { Box } from 'grommet';

import { EXCHANGE_STEPS } from '../../../stores/Exchange';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import { Price } from '../../Explorer/Components';
import { formatWithSixDecimals, truncateAddressString, unlockToken } from 'utils';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useStores } from '../../../stores';
import ProgressBar from "@ramonak/react-progress-bar";
import { SwapStatus } from '../../../constants';
import { CopyRow } from "../utils"

export const CheckTransaction = observer(() => {

    const { exchange } = useStores();

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
                        <Box>
                            <Icon size="160" glyph="Search" />
                        </Box>


                        <Box style={{ height: 25 }} direction="row" align="center" margin={{ top: 'large' }}>
                            <Text>Your transaction is <b>{status}</b></Text>
                        </Box>

                        <Box direction='column' fill margin={{ top: 'xsmall' }}>
                            <ProgressBar bgcolor="#00BFFF" completed={(exchange.operation.status / 4) * 100} isLabelVisible={false} />
                        </Box>

                        <Text margin={{ top: 'medium' }}><b>Confirmations:</b> {exchange.confirmations}</Text>

                        <Text size="small" color="#748695" margin={{ top: 'xxsmall', bottom: 'medium' }}>
                            Its save to assume that once we have <b>6 network confirmations</b> the tokens arrived to your wallet.
                        </Text>


                        {exchange.operation && <CopyRow
                            label="Operation ID"
                            value={truncateAddressString(exchange.operation.id, 15)}
                            rawValue={exchange.operation.id}
                        />}
                        {exchange.operation.transactionHash && <Box margin={{ top: 'xxsmall' }}><CopyRow
                            label="Transaction Hash"
                            value={truncateAddressString(exchange.operation.transactionHash, 15)}
                            rawValue={exchange.operation.transactionHash}
                        /></Box>}

                    </Box>

                </Modal.Content>
            </React.Fragment>

        </Modal>
    )
})