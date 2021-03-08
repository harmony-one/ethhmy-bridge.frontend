
import * as React from 'react';
import { useEffect, useState } from 'react';
import HeadShake from 'react-reveal/HeadShake';
import { Box } from 'grommet';
import { Text, Title, Icon } from 'components/Base';
import Loader from 'react-loader-spinner';
import * as styles from './styles.styl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { unlockToken } from 'utils';
import { BridgeHealth } from '../../components/Secret/BridgeHealthIndicator';

export const TokenLocked = (props: { user: any, onFinish: Function }) => {

    const [intervalID, setIntervalID] = useState<number>(null);


    return <HeadShake bottom>
        <Box direction="column">
            <Text bold color="#c5bb2e">Warning</Text>
            <Text margin={{ top: 'xxsmall', bottom: 'xxsmall' }}>SecretTokens are privacy tokens. In order to see your token balance, you will need to <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={async () => {
                try {
                    console.log(props.user.chainId, props.user.snip20Address)
                    await props.user.keplrWallet.suggestToken(props.user.chainId, props.user.snip20Address);
                    props.onFinish(true)
                } catch (error) {
                    console.log(error);
                    props.onFinish(false)
                }
            }}>create a viewing key.</span>
            </Text>

        </Box>
    </HeadShake>
}


export type NetworkTemplateInterface = {
    name: string,
    wallet: string
    image: string
    symbol: string
    amount: string;

}

export const NetworkTemplate = (props: {
    template: NetworkTemplateInterface, onSwap: boolean
}) => (
    <HeadShake spy={props.onSwap} delay={0}>
        <Box direction="column" style={{ minWidth: 230 }}>
            <BridgeHealth from_scrt={props.template.name !== "Ethereum"} />
            <Box direction="row" align={"start"} margin={{ bottom: 'small', top: 'xxsmall' }}>
                <img style={{ marginRight: 10 }} className={styles.imgToken} src={props.template.name === "Ethereum" ? "/static/eth.svg" : "/static/scrt.svg"} />

                <Box direction="column" >
                    <Title bold color={"#30303D"} margin={{ bottom: 'xxsmall' }}>{props.template.name}</Title>
                    <Text size="medium" bold color={"#748695"}>{props.template.wallet}</Text>
                </Box>

            </Box>

            {props.template.symbol ? <Box
                pad="xsmall"
                direction="row"
                align={"center"}
                className={styles.networktemplatetoken}>
                {props.template.image && <img src={props.template.image} style={{ width: 20, margin: '0 5' }} alt={props.template.symbol} />}
                {props.template.amount === 'loading' ?
                    <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1.5em" style={{ margin: '0 10' }} /> :
                    props.template.amount === unlockToken ? <Box direction="row" style={{ margin: '0 5' }}>
                        <img src="/static/visibility.svg" width="17" alt="locked" />
                    </Box> :
                        <Text bold color="#30303D" size="medium" style={{ margin: '0 5' }}>{props.template.amount}</Text>}
                <Text bold style={{ margin: '0 5' }} color="#748695" size="medium">{props.template.symbol}</Text>
            </Box> : <Box style={{ height: 44 }}></Box>}
        </Box>
    </HeadShake>
)

export const CopyRow = (props: { label: string, value: string, rawValue: string }) => <HeadShake bottom>
    <Box style={{ height: 25 }} direction="row" align="center" justify="between">
        <Text size="small" bold>{props.label}</Text>

        <Box direction="row" align="center">
            <Text>{props.value}</Text>

            <CopyToClipboard text={props.rawValue}>
                <Icon glyph="PrintFormCopy" size="1em" color="#1c2a5e" style={{ marginLeft: 10, width: 20 }} />
            </CopyToClipboard>
        </Box>

    </Box>
</HeadShake>