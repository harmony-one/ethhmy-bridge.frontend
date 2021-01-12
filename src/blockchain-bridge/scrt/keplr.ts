
export const getViewingKey = async (params: {keplr: any, chainId: string, address: string}) => {
  return await params.keplr.getSecret20ViewingKey(
    params.chainId,
    params.address,
  );
}


