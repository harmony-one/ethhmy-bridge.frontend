
import * as React from 'react';
import HeadShake from 'react-reveal/HeadShake';
import { Box } from 'grommet';
import { Text, Title, Icon } from 'components/Base';
import Wobble from 'react-reveal/Wobble';
import Loader from 'react-loader-spinner';
import * as styles from './styles.styl';
import { CopyToClipboard } from 'react-copy-to-clipboard';


export const TokenLocked = (user: any) => <HeadShake bottom>
    <Box direction="column">
        <Text bold color="#c5bb2e">Warning</Text>
        <Text margin={{ top: 'xxsmall', bottom: 'xxsmall' }}>Everything inside Secret Network is private by default, in order for you to view this token balance, you will need to create a viewing key.
        </Text>
        <Box style={{ cursor: 'pointer' }} onClick={async () => {
            try {
                console.log(user.chainId, user.snip20Address)
                await user.keplrWallet.suggestToken(user.chainId, user.snip20Address);
            } catch (error) {
                console.log(error);
            }
        }}>
            <Text bold>Create a Viewing key</Text>
        </Box>

    </Box>
</HeadShake>



export type NetworkTemplateInterface = {
    name: string,
    wallet: string
    image: string
    symbol: string
    amount: string;
}

export const NetworkTemplate = (props: {
    template: NetworkTemplateInterface, align: any, onSwap: boolean
}) => (
    <Wobble spy={props.onSwap} delay={0}>
        <Box direction="column" style={{ minWidth: 230 }}>
            <Box direction="row" align={"start"} justify={props.align} margin={{ bottom: 'small' }}>
                {props.align === "start" && <img style={{ marginRight: 10 }} className={styles.imgToken} src={props.template.name === "Ethereum" ? "/static/eth.svg" : "/static/scrt.svg"} />}
                <Box direction="column" align={props.align}>
                    <Title bold color={"#30303D"} margin={{ bottom: 'xxsmall' }}>{props.template.name}</Title>
                    <Text size="medium" bold color={"#748695"}>{props.template.wallet}</Text>
                </Box>
                {props.align === "end" && <img style={{ marginLeft: 10 }} className={styles.imgToken} src={props.template.name === "Ethereum" ? "/static/eth.svg" : "/static/scrt.svg"} />}
            </Box>

            {props.template.symbol ? <Box
                pad="xsmall"
                direction="row"
                align={"center"}
                style={{ flexFlow: props.align === 'start' ? 'row' : 'row-reverse' }}
                className={styles.networktemplatetoken}>
                {props.template.image && <img src={props.template.image} style={{ width: 20, margin: '0 5' }} alt={props.template.symbol} />}
                {props.template.amount === 'loading' ?
                    <Loader type="ThreeDots" color="#00BFFF" height="1em" width="2em" style={{ margin: '0 10' }} /> :
                    <Text bold color="#30303D" size="medium" style={{ margin: '0 5' }}>{props.template.amount}</Text>}
                <Text bold style={{ margin: '0 5' }} color="#748695" size="medium">{props.template.symbol}</Text>
            </Box> : <Box style={{ height: 44 }}></Box>}
        </Box>
    </Wobble>
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