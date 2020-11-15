import { decode } from 'bech32';

const HRP = "secret";

export const getScrtAddress = address => {
  try {
    const decoded = decode(address, 46);
    return decoded.prefix === HRP ? address : '';
  } catch {
    return '';
  }
}

// getAddress(address).bech32;
