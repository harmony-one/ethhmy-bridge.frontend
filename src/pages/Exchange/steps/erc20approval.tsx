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
import HeadShake from 'react-reveal/HeadShake';


@inject('user', 'exchange', 'actionModals', 'userMetamask', 'routing')
@observer
export class ERC20ApprovalModal extends React.Component<
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

        const { exchange } = this.props;
        return (
            <Modal
                onClose={() => exchange.stepNumber = EXCHANGE_STEPS.BASE}
                open={exchange.step.modal}
                style={{ width: '500px', display: 'flex' }}
            >

                <React.Fragment>
                    <Modal.Header>
                        <div style={{ padding: "12 32", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title bold>Approve {exchange.transaction.tokenSelected.symbol}!</Title>
                            <span style={{ cursor: 'pointer' }} onClick={() => exchange.stepNumber = EXCHANGE_STEPS.BASE}>
                                <Icon size="23" glyph="Close" />
                            </span>
                        </div>
                    </Modal.Header>
                    <Modal.Content>
                        <Box direction="column" fill={true} pad="large">

                            <Box direction="row" fill={true} justify="center" align="center" style={{ marginBottom: 26 }}>
                                <Icon size="160" glyph="Check2" />
                            </Box>
                            <Text bold size="medium" margin={{ top: 'large' }}>Why am I doing this?</Text>
                            <Text size="small" color="#748695" margin={{ top: 'xsmall' }}>In order for the bridge to move your erc20 tokens to Secret Network it first needs your approval. This is only <b>required once</b> per erc20 token!</Text>
                            <Box style={{ height: 40 }} direction="row" justify="between" align="start" margin={{ top: 'large' }}>
                                <Text bold size="small" color="#00ADE8" >Fee</Text>
                                {exchange.isFeeLoading ? <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" /> : <Price
                                    value={exchange.networkFee}
                                    isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT}
                                    boxProps={{ pad: {} }}
                                />}
                            </Box>

                            <Box className={styles.follow_transaction} style={{ height: 25 }} margin={{ top: 'medium' }}>
                                {exchange.txHash && <HeadShake bottom><Text>Follow Transaction <a href={`${process.env.ETH_EXPLORER_URL}/tx/${exchange.txHash}`}
                                    style={{ textDecoration: 'none' }}
                                    target="_blank"
                                    rel="noreferrer">Here</a></Text></HeadShake>}
                            </Box>

                            {exchange.transaction.error && <HeadShake bottom>
                                <Box margin={{ top: 'xsmall' }}>
                                    <Text color="red">{exchange.transaction.error}</Text>
                                </Box>
                            </HeadShake>}

                            <Box fill align="center" margin={{ top: 'large' }}>
                                <Button
                                    className={styles.fill}
                                    style={{ height: 50, width: '100%', background: "#00ADE8", color: "white" }}
                                    onClick={() => {
                                        if (exchange.transaction.loading) return ""
                                        if (exchange.isTokenApproved) return exchange.stepNumber = EXCHANGE_STEPS.BASE
                                        return exchange.step.onClick()
                                    }}>
                                    {exchange.transaction.loading ? <Loader type="ThreeDots" color="#00BFFF" height="1em" width="5em" /> :
                                        (exchange.isTokenApproved ? <span><b>Approved.</b> Step into the Bridge</span> : "Confirm")}
                                </Button>
                            </Box>


                        </Box>

                    </Modal.Content>
                </React.Fragment>
            </Modal>
        )
    }
}