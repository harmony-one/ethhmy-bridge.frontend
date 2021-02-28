import { BigNumber } from 'bignumber.js';
const BN = require('bn.js');

export const toFixedTrunc = (x, n) => {
  const v = (typeof x === 'string' ? x : x.toString()).split('.');
  if (n <= 0) return v[0];
  let f = v[1] || '';
  if (f.length > n) return `${v[0]}.${f.substr(0, n)}`;
  while (f.length < n) f += '0';
  return `${v[0]}.${f}`;
};

export const balanceNumberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
  useGrouping: true,
});

export const valueToDecimals = (value: string, decimals: string): string => {
  return BigInt(parseFloat(value) * Math.pow(10, parseInt(decimals))).toString();
};

export const zeroDecimalsFormatter = new Intl.NumberFormat('en-US', {
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

export function truncateSymbol(symbol: string, num: number = 6) {
  if (!symbol) {
    return '';
  }

  if (symbol.length <= 6) {
    return symbol;
  }

  const first = symbol.slice(0, num);
  return `${first}..`;
}

export function truncateAddressString(address: string, num = 12) {
  if (!address) {
    return '';
  }

  const first = address.slice(0, num);
  const last = address.slice(-num);
  return `${first}...${last}`;
}

export const sortedStringify = (obj: any) => JSON.stringify(obj, Object.keys(obj).sort());

export const mulDecimals = (amount: string | number, decimals: string | number) => {
  const decimalsMul = `10${new Array(Number(decimals)).join('0')}`;
  const amountStr = new BigNumber(amount).multipliedBy(decimalsMul);

  return new BN(amountStr.toFixed());
};

export const divDecimals = (amount: string | number, decimals: string | number) => {
  if (decimals === 0) {
    return String(amount);
  }

  const decimalsMul = `10${new Array(Number(decimals)).join('0')}`;
  const amountStr = new BigNumber(amount).dividedBy(decimalsMul);

  return amountStr.toFixed();
};

export const UINT128_MAX = '340282366920938463463374607431768211454';

export const displayHumanizedBalance = (
  balance: BigNumber,
  roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP,
  decimals: number = 6,
): string =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    useGrouping: true,
  }).format(Number(balance.toFixed(decimals, roundingMode)));

export const humanizeBalance = (balance: BigNumber, decimals: number): BigNumber =>
  balance.dividedBy(new BigNumber(`1e${decimals}`));

export const canonicalizeBalance = (balance: BigNumber, decimals: number): BigNumber =>
  balance.multipliedBy(new BigNumber(`1e${decimals}`));
