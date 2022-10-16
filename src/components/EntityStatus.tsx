import React from 'react';
import {
  Clock,
  StatusCritical,
  StatusGood,
  StatusWarning,
} from 'grommet-icons';
import { Box } from 'grommet';
import { Text } from 'components/Base';
import { STATUS } from '../stores/interfaces';

interface Props {
  status: STATUS;
}

const boxProps = {
  direction: 'row',
  align: 'center',
  gap: 'xxsmall',
} as const;

export const StatusError: React.FC<{ label?: string }> = ({ label }) => {
  const text = label || 'Error';
  return (
    <Box {...boxProps}>
      <StatusWarning size="16px" color="Red" />
      <Text size="small" margin={{ top: '2px' }} color="Red">
        {text}
      </Text>
    </Box>
  );
};

StatusError.displayName = 'StatusError';

export const StatusPending: React.FC<{ label?: string }> = ({ label }) => {
  const text = label || 'Pending';
  return (
    <Box {...boxProps}>
      <Clock size="16px" color="Orange" />
      <Text size="small" margin={{ top: '2px' }} color="Orange500">
        {text}
      </Text>
    </Box>
  );
};

StatusPending.displayName = 'StatusPending';

export const StatusCanceled: React.FC<{ label?: string }> = ({ label }) => {
  const text = label || 'Canceled';
  return (
    <Box {...boxProps}>
      <StatusCritical size="16px" color="Gray" />
      <Text size="small" margin={{ top: '2px' }} color="Gray">
        {text}
      </Text>
    </Box>
  );
};

StatusCanceled.displayName = 'StatusCanceled';

export const StatusCompleted: React.FC<{ label?: string }> = ({ label }) => {
  const text = label || 'Completed';
  return (
    <Box {...boxProps}>
      <StatusGood size="16px" color="Green" />
      <Text size="small" margin={{ top: '2px' }} color="Green">
        {text}
      </Text>
    </Box>
  );
};

StatusCompleted.displayName = 'StatusCompleted';

export const EntityStatus: React.FC<Props> = ({ status }) => {
  if (status === STATUS.SUCCESS) {
    return <StatusCompleted />;
  }

  if (status === STATUS.WAITING) {
    return <StatusPending />;
  }

  if (status === STATUS.CANCELED) {
    return <StatusCanceled />;
  }

  return <StatusError />;
};

EntityStatus.displayName = 'EntityStatus';
