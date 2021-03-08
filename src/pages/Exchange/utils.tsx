
import * as React from 'react';
import { useEffect, useState } from 'react';
import HeadShake from 'react-reveal/HeadShake';
import { Box } from 'grommet';
import { Text, Title, Icon } from 'components/Base';
import Loader from 'react-loader-spinner';
import * as styles from './styles.styl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { unlockToken } from 'utils';
import { Icon as IconUI } from 'semantic-ui-react';
import { useStores } from 'stores';

export const createViewingKey = async (user: any, callback?: Function) => {
    try {
        console.log(user.chainId, user.snip20Address)
        await user.keplrWallet.suggestToken(user.chainId, user.snip20Address);
        callback(true)
    } catch (error) {
        console.log(error);
        callback(false)
    }
}

export const ViewingKeyIcon = (props: { user: any, callback?: Function }) => {

    return (
        <Box onClick={() => {
            createViewingKey(props.user, props.callback)
        }}>
            🔍
        </Box>
    )

}

export const TokenLocked = (props: { user: any, onFinish: Function }) => {

    return <HeadShake bottom>
        <Box direction="column">
            <Text bold color="#c5bb2e">Warning</Text>
            <Text margin={{ top: 'xxsmall', bottom: 'xxsmall' }}>SecretTokens are privacy tokens. In order to see your token balance, you will need to <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={async () => {
                createViewingKey(props.user, props.onFinish)
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
    health: boolean;
}

export const NetworkTemplate = (props: {
    template: NetworkTemplateInterface, onSwap: boolean, user: any
}) => (
    <HeadShake spy={props.onSwap} delay={0}>
        <Box direction="column" style={{ minWidth: 230 }}>
            <Box direction="row" align={"start"} margin={{ top: 'xxsmall' }}>
                <Box direction="column" style={{ marginRight: 7 }} align="center">
                    <img style={{ marginBottom: 5 }} height="37" src={props.template.name === "Ethereum" ? "/static/eth.svg" : "/static/scrt.svg"} />
                    <IconUI style={{ margin: 0 }} className={'circle'} color={props.template.health ? 'green' : 'red'} />
                </Box>

                <Box direction="column" >
                    <Title bold color={"#30303D"} margin={{ bottom: 'xxsmall' }}>{props.template.name}</Title>
                    <Text size="medium" bold color={"#748695"}>{props.template.wallet}</Text>
                    <Text size="xsmall" color={"#748695"}>{props.template.health ? 'Live' : 'Down'}</Text>
                </Box>

            </Box>

            {props.template.symbol && <Box
                pad="xsmall"
                direction="row"
                align={"center"}
                margin={{ top: 'xxsmall' }}
                className={styles.networktemplatetoken}>
                {props.template.image && <img src={props.template.image} style={{ width: 20, margin: '0 5' }} alt={props.template.symbol} />}
                {props.template.amount === 'loading' ?
                    <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1.5em" style={{ margin: '0 10' }} /> :
                    props.template.amount === unlockToken ? <Box direction="row" style={{ margin: '0 5' }}>
                        <ViewingKeyIcon user={props.user} />
                    </Box> :
                        <Text bold color="#30303D" size="medium" style={{ margin: '0 5' }}>{props.template.amount}</Text>}
                <Text bold style={{ margin: '0 5' }} color="#748695" size="medium">{props.template.symbol}</Text>
            </Box>}
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