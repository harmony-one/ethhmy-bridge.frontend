import { web3 } from './eth';

export const getEthBalance = (ethAddress): Promise<string> => {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(ethAddress, (err, balance) => {
      if (err) {
        reject(err);
      }
      // const rez = String(new BN(balance).div(new BN(1e18)));

      resolve(String(Number(balance) / 1e18));
    });
  });
};

// Source: https://medium.com/@piyopiyo/how-to-get-erc20-token-balance-with-web3-js-206df52f2561
export const getErc20Balance = async (ethAddress, tokenAddress): Promise<string> => {
  // The minimum ABI to get ERC20 Token balance
  const minimumErc20Abi = [
    // balanceOf
    {
      constant: true,
      inputs: [
        {
          name: '_owner',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          name: 'balance',
          type: 'uint256',
        },
      ],
      type: 'function',
    },
  ];

  const contract = new web3.eth.Contract(minimumErc20Abi, tokenAddress);

  return contract.methods.balanceOf(ethAddress).call();
};
