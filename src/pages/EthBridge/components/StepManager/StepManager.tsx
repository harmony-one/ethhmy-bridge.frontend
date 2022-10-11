import React from 'react';
import { useStores } from '../../../../stores';
import { EXCHANGE_STEPS } from '../../../../stores/Exchange';
import { StepBASE } from '../StepBASE/StepBASE';
import { observer } from 'mobx-react';
import { StepAPPROVE } from '../StepAPPROVE/StepAPPROVE';
import { StepCONFIRMATION } from '../StepCONFIRMATION/StepCONFIRMATION';
import { StepSENDING } from '../StepSENDING/StepSENDING';
import { StepRESULT } from '../StepRESULT/StepRESULT';

interface Props {}

export const StepManager: React.FC<Props> = observer(() => {
  const { bridgeFormStore } = useStores();

  if (bridgeFormStore.bridgeStep === EXCHANGE_STEPS.BASE) {
    return <StepBASE />;
    // return <StepAPPROVE />;
  }

  if (bridgeFormStore.bridgeStep === EXCHANGE_STEPS.APPROVE) {
    return <StepAPPROVE />;
  }

  if (bridgeFormStore.bridgeStep === EXCHANGE_STEPS.CONFIRMATION) {
    return <StepCONFIRMATION />;
  }

  if (bridgeFormStore.bridgeStep === EXCHANGE_STEPS.SENDING) {
    return <StepSENDING />;
  }

  if (bridgeFormStore.bridgeStep === EXCHANGE_STEPS.RESULT) {
    return <StepRESULT />;
  }

  return <div>Step undefined</div>;
});

StepManager.displayName = 'StepManager';
