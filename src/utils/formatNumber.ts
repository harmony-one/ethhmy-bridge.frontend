import { BigNumber } from 'bignumber.js';
const BN = require('bn.js');

const zeroDecimalsFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatZeroDecimals(value: number | string) {
  return zeroDecimalsFormatter.format(Number(value));
}

const twoDecimalsFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const sixDecimalsFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 6,
});

export function formatWithTwoDecimals(value: number | string) {
  return twoDecimalsFormatter.format(Number(value));
}

export function formatWithSixDecimals(value: number | string) {
  return sixDecimalsFormatter.format(Number(value));
}

export function formatWithTwoDecimalsRub(value: number) {
  return `${formatWithTwoDecimals(value)} ₽`;
}

export function ones(value: number | string) {
  return Number(value) / 1e18;
}

export function truncateAddressString(address: string, num = 12) {
  if (!address) {
    return '';
  }

  const first = address.slice(0, num);
  const last = address.slice(-num);
  return `${first}...${last}`;
}

export const mulDecimals = (
  amount: string | number,
  decimals: string | number,
) => {
  if (!Number(decimals)) {
    return new BN(amount);
  }

  const decimalsMul = `10${new Array(Number(decimals)).join('0')}`;
  const amountStr = new BigNumber(amount).multipliedBy(decimalsMul);

  return new BN(amountStr.toFixed());
};

export const divDecimals = (
  amount: string | number,
  decimals: string | number,
) => {
  if (!Number(decimals)) {
    return new BN(amount);
  }

  const decimalsMul = `10${new Array(Number(decimals)).join('0')}`;
  const amountStr = new BigNumber(amount).dividedBy(decimalsMul);

  return amountStr.toFixed();
};

export const sliceByLength = (str: string, maxLength: number) => {
  if (str && str.length > maxLength) {
    return str.slice(0, maxLength - 2) + '...';
  }

  return str;
};
