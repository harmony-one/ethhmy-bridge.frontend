import Web3 from 'web3';
import utils from 'web3-utils';
import { getGasPrice } from '../../blockchain-bridge/eth/helpers';
const BN = require('bn.js');
const { abi: ProxyERC20Abi } = require('./ProxyERC20Abi');
const { abi: ProxyHRC20Abi } = require('./ProxyHRC20Abi');
const { abi: ERC20Abi } = require('./ERC20Abi');

const layerZeroConfig = {
  ethereum: {
    endpoint: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675',
    chainId: 101,
  },
  bsc: {
    endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
    chainId: 102,
  },
  harmony: {
    endpoint: '0x9740FF91F1985D8d2B71494aE1A2f723bb3Ed9E4',
    chainId: 116,
  },
};

// 1LINK token addresses
const tokenConfig = {
  proxyERC20: '0xEe381e476b4335B8584A2026f3E845edaC2c69de',
  proxyHRC20: '0x6bEe6e5cf8E02833550B228D9CC6aD19Dae3743E',
  erc20Address: '0x514910771af9ca656af840dff83e8264ecf986ca',
  hrc20Address: '0x218532a12a389a4a92fc0c5fb22901d1c19198aa',
};

// const - 500k gasLimit
const adapterParams =
  '0x0001000000000000000000000000000000000000000000000000000000000007a120';

// https://api.s0.t.hmny.io/
const hmyRPCUrl = 'https://api.harmony.one';

const ethRPCUrl =
  'https://mainnet.infura.io/v3/5c21c1256d824ca39dfceb0815f757a2';

// @ts-ignore
const web3 = new Web3(window.ethereum);

// const USER_PK = proceess.env.USER_PK;

// const account = web3.eth.accounts.privateKeyToAccount(USER_PK);
// web3.eth.accounts.wallet.add(account);

const getTokenBalance = async (tokenAddr, userAddr) => {
  const tokenContract = new web3.eth.Contract(ERC20Abi, tokenAddr);

  const balance = await tokenContract.methods.balanceOf(userAddr).call();

  return balance;
};

const loadAllowance = async (tokenAddress, externalContract) => {
  // @ts-ignore
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  const tokenContract = new web3.eth.Contract(ERC20Abi, tokenAddress);

  const res = await tokenContract.methods
    .allowance(accounts[0], externalContract)
    .call();

  return res;
};

const approveToken = async (tokenAddress, externalContract, amount) => {
  const tokenContract = new web3.eth.Contract(ERC20Abi, tokenAddress);

  // @ts-ignore
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  console.log('### accounts', accounts);

  const gasPrice = await getGasPrice(web3);
  debugger;

  const res = await tokenContract.methods
    .approve(externalContract, new BN('500000000000000000'))
    .send({
      from: accounts[0],
      // gas: 4712388,
      // gasPrice: new BN(await web3.eth.getGasPrice()),
      gas: 100000,
      gasPrice: gasPrice,
    });

  return res;
};

export const loadSendFee = async (
  amountWei: string,
  destinationAddress: string,
) => {
  const proxyContract = new web3.eth.Contract(
    ProxyERC20Abi,
    tokenConfig.proxyERC20,
  );

  const sendFee = await proxyContract.methods
    .estimateSendFee(
      layerZeroConfig.harmony.chainId, // NETWORK
      destinationAddress, // to user address
      amountWei,
      false,
      adapterParams,
    )
    .call();

  return sendFee;
};

// send 1LINK ETH -> HMY

interface Send1LinkParams {
  amount: string;
  approveAmount: string;
  sourceAddress: string;
  destinationAddress: string;
}

export const send1LINK = async (params: Send1LinkParams) => {
  const amountWei = utils.toWei(params.amount);
  const approveAmountWei = utils.toWei(params.approveAmount);

  console.log('User address: ', params.destinationAddress);

  const balance = await getTokenBalance(
    tokenConfig.erc20Address,
    params.destinationAddress,
  );
  console.log('Balance 1LINK: ', balance);

  const allowanceRes = await loadAllowance(
    tokenConfig.erc20Address,
    tokenConfig.proxyERC20,
  );

  console.log('### allowanceRes', allowanceRes);

  if (new BN(allowanceRes).lt(new BN(amountWei))) {
    console.log('### request new approve');

    // 1 Step - approve token contract
    const approveTokenRes = await approveToken(
      tokenConfig.erc20Address,
      tokenConfig.proxyERC20,
      approveAmountWei,
    );
    console.log('Approve token res: ', approveTokenRes);
  }

  const proxyContract = new web3.eth.Contract(
    ProxyERC20Abi,
    tokenConfig.proxyERC20,
  );

  const sendFee = await loadSendFee(amountWei, params.destinationAddress);

  console.log('Send Fee: ', sendFee);

  // @ts-ignore
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  const gasPrice = await getGasPrice(web3);

  debugger;
  const res = await proxyContract.methods
    .sendFrom(
      params.sourceAddress, // from user address
      layerZeroConfig.harmony.chainId,
      params.destinationAddress, // to user address
      amountWei,
      params.sourceAddress, // refund address
      '0x0000000000000000000000000000000000000000', // const
      adapterParams,
    )
    .send({
      value: sendFee.nativeFee,
      from: accounts[0],
      gas: 250000,
      // gasPrice: new BN(await web3.eth.getGasPrice()),
      gasPrice: gasPrice,
    });

  console.log(res);
};
