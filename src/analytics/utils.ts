import { BigNumber } from '@ethersproject/bignumber';
import { parseEther, parseUnits } from '@ethersproject/units';

const ONE = parseUnits('1');
const ZERO_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export function getAsset(tokens, asset) {
  let {
    id,
    network,
    symbol,
    name,
    decimals,
    mappedAddress,
    totalLocked,
    dayData,
  } = asset;

  const address =
    id === ZERO_ADDRESS
      ? '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
      : id.toLowerCase();

  const token = tokens.allData.find(
    token => token.hrc20Address.toLowerCase() === address,
  );

  const price = token && token.usdPrice ? token.usdPrice : 0;

  let volume = BigNumber.from(0);

  try {
    volume = BigNumber.from(dayData && dayData[0] ? dayData[0].volume : 0)
      .mul(parseEther(String(price)))
      .div(ONE);
  } catch (error) {}

  let tvl = BigNumber.from(0);

  try {
    tvl = BigNumber.from(totalLocked)
      .mul(100) // for decimal precision
      .mul(parseEther(String(price)))
      .div(ONE)
      .div(BigNumber.from(10).pow(decimals));
  } catch (error) {}

  let mappedNetwork = network === 'HARMONY' ? 'ETHEREUM' : network;

  return {
    id,
    network,
    symbol,
    name,
    decimals,
    mappedAddress: mappedAddress || (token && token.erc20Address.toLowerCase()),
    tvl,
    totalLocked,
    volume,
    price: token && token.usdPrice ? token.usdPrice : 0,
    dayData,
    mappedNetwork,
  };
}

export function getAssets(tokens, data) {
  let assets = [];

  if (!tokens.isPending && data) {
    assets = data.assets.map(asset => getAsset(tokens, asset));
  }

  return assets;
}

export function getDailyAssetTVL(asset) {
  const data = new Map<number, BigNumber>();
  if (asset && asset.price && asset.dayData) {
    try {
      const price = parseUnits(String(asset.price));
      const decimals = BigNumber.from(10).pow(asset.decimals);
      for (const { totalLocked, date } of asset.dayData) {
        data.set(
          date,
          BigNumber.from(totalLocked)
            .mul(price)
            .div(decimals)
            .div(ONE),
        );
      }
    } catch (e) {}
  }
  return data;
}

export function getDailyAssetsTVL(assets) {
  const data = new Map<number, BigNumber>();

  for (const asset of assets) {
    for (const [date, tvl] of getDailyAssetTVL(asset)) {
      if (!data.has(date)) {
        data.set(date, BigNumber.from(0));
      }
      data.set(date, data.get(date).add(BigNumber.from(tvl)));
    }
  }

  return Array.from(data.entries()).sort((a, b) => (a[0] > b[0] ? 1 : -1));
}

export function getDailyAssetVolume(asset) {
  const data = new Map<number, BigNumber>();
  if (asset && asset.price && asset.dayData) {
    try {
      const price = parseUnits(String(asset.price));
      const decimals = BigNumber.from(10).pow(asset.decimals);
      for (const { volume, date } of asset.dayData) {
        data.set(
          date,
          BigNumber.from(volume)
            .mul(price)
            .div(decimals)
            .div(ONE),
        );
      }
    } catch (e) {}
  }

  return Array.from(data.entries()).sort((a, b) => (a[0] > b[0] ? 1 : -1));
}

export function getDailyAssetsVolume(assets) {
  const data = new Map<number, BigNumber>();

  for (const asset of assets) {
    for (const [date, volume] of getDailyAssetVolume(asset)) {
      if (!data.has(date)) {
        data.set(date, BigNumber.from(0));
      }
      data.set(date, data.get(date).add(BigNumber.from(volume)));
    }
  }

  return Array.from(data.entries()).sort((a, b) => (a[0] > b[0] ? 1 : -1));
}
