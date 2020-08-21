export const BLOCK_TO_FINALITY = 13;
export const AVG_BLOCK_TIME = 20 * 1000;
export const sleep = duration => new Promise(res => setTimeout(res, duration));

export function normalizeEthKey(key) {
  let result = key.toLowerCase();
  if (!result.startsWith('0x')) {
    result = '0x' + result;
  }
  return result;
}
