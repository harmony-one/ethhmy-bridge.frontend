import React, { useEffect, useState } from 'react';
import Loader from 'react-loader-spinner';
import SoftTitleValue from '../SoftTitleValue';
import UnlockToken from '../EarnRow/UnlockToken';
import NumberOdometer from '../NumberOdometer';
import { UserStoreEx } from '../../../stores/UserStore';
import * as styles from '../EarnRow/styles.styl';
import cn from 'classnames';
import { divDecimals, unlockToken } from '../../../utils';
import { useStores } from 'stores';
import { Transition } from 'semantic-ui-react';

const formatNumber = (amount: string, minimumFactions: number) => {
  return new Intl.NumberFormat('en', {
    maximumFractionDigits: 6,
    minimumFractionDigits: minimumFactions,
  }).format(Number(amount));
};

const ScrtTokenBalance = (props: {
  value: string;
  decimals: string | number;
  currency: string;
  subtitle?: string;
  userStore: UserStoreEx;
  tokenAddress: string;
  selected: boolean;
  minimumFactions?: number;
  pulse: boolean;
  pulseInterval: number;
}) => {
  const { user } = useStores();
  const [value, setValue] = useState<string>(props.value);
  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const text = props.subtitle ? props.subtitle : 'Available Balance';

  const minimumFactions =
    props.minimumFactions !== undefined ? props.minimumFactions : 3;

  if (!value) {
    return (
      <SoftTitleValue
        title={
          <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />
        }
        subTitle={
          user.secretjs ? 'Fetching Balance...' : 'Connecting to Keplr...'
        }
      />
    );
  } else if (value === unlockToken) {
    return (
      <Transition animation="pulse" duration={500} visible={props.pulse}>
        <div style={{ margin: 0, display: 'flex', flex: 1 }}>
          <UnlockToken
            userStore={props.userStore}
            tokenAddress={props.tokenAddress}
            selected={props.selected}
            subTitle={props.currency}
            pulseInterval={props.pulseInterval}
          />
        </div>
      </Transition>
    );
  } else {
    return (
      <SoftTitleValue
        title={
          <div className={cn(styles.assetRow)}>
            <NumberOdometer
              number={`${formatNumber(
                divDecimals(value.replace(/,/g, ''), props.decimals),
                minimumFactions,
              )}`}
            />
            <div style={{ marginLeft: '5px', paddingTop: '4px' }}>
              {props.currency}
            </div>
          </div>
        }
        subTitle={text}
      />
    );
  }
};

export default ScrtTokenBalance;
