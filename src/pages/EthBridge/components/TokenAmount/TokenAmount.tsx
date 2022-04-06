import React, { useEffect, useState } from 'react';
import { Text } from '../../../../components/Base';
import { BridgeControl } from '../BridgeControl/BridgeControl';
import { Form, isRequired, NumberInput } from '../../../../components/Form';
import { moreThanZero } from '../../../../utils';
import { useStores } from '../../../../stores';
import * as s from './TokenAmount.styl';
import cn from 'classnames';
import { ethBridgeStore } from '../../EthBridgeStore';
import { observer } from 'mobx-react';

interface Props {}

export const TokenAmount: React.FC<Props> = observer(() => {
  const { exchange } = useStores();

  const [formRef, setFormRef] = useState();

  useEffect(() => {
    if (formRef) {
      ethBridgeStore.formRefStepBASE = formRef;
    }
  }, [formRef]);

  return (
    <BridgeControl
      title="Amount"
      gap="8px"
      centerContent={
        <>
          {/*<Text size="large" color="NWhite">*/}
          {/*  0.00*/}
          {/*</Text>*/}
          <Form
            ref={ref => setFormRef(ref)}
            data={exchange.transaction}
            {...({} as any)}
          >
            <NumberInput
              className={cn(s.input, 'test01')}
              name="amount"
              type="decimal"
              precision="0"
              bgColor="transparent"
              border="none"
              delimiter="."
              placeholder="0"
              style={{ width: '100%', textAlign: 'center' }}
              rules={[
                isRequired,
                moreThanZero,
                (_, value, callback) => {
                  const errors = [];

                  // if (value && Number(value) > Number(this.tokenInfo.maxAmount)) {
                  //   const defaultMsg = `Exceeded the maximum amount`;
                  //   errors.push(defaultMsg);
                  // }

                  callback(errors);
                },
              ]}
            />
          </Form>
        </>
      }
      bottomContent={
        <Text size="xxsmall" color="NGray">
          100 Max Available
        </Text>
      }
    />
  );
});

TokenAmount.displayName = 'TokenAmount';
