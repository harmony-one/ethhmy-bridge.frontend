// import detectEthereumProvider from '@metamask/detect-provider';
//
// // @ts-ignore
// let ethereum = window.ethereum;
//
// function startApp(provider) {
//   // If the provider returned by detectEthereumProvider is not the same as
//   // window.ethereum, something is overwriting it, perhaps another wallet.
//   // @ts-ignore
//   if (provider !== window.ethereum) {
//     console.error('Do you have multiple wallets installed?');
//   }
//   // Access the decentralized web!
// }
//
// /**********************************************************/
// /* Handle chain (network) and chainChanged (per EIP-1193) */
// /**********************************************************/
//
// // Normally, we would recommend the 'eth_chainId' RPC method, but it currently
// // returns incorrectly formatted chain ID values.
// let currentChainId = ethereum.chainId;
//
// ethereum.on('chainChanged', handleChainChanged);
//
// function handleChainChanged(_chainId) {
//   // We recommend reloading the page, unless you must do otherwise
//   // window.location.reload();
// }
//
// let currentAccount = null;
//
// ethereum.on('accountsChanged', handleAccountsChanged);
//
// // For now, 'eth_accounts' will continue to always return an array
// function handleAccountsChanged(accounts) {
//   console.log('accounts', accounts)
//
//   if (accounts.length === 0) {
//     // MetaMask is locked or the user has not connected any accounts
//     console.log('Please connect to MetaMask.');
//   } else {
//     currentAccount = accounts[0];
//   }
// }
// export const connectMetamask = async () => {
//   const provider = await detectEthereumProvider();
//
//   if (provider) {
//     startApp(provider); // Initialize your app
//   } else {
//     throw new Error ('Metamask not found');
//   }
//
//   ethereum
//     .request({ method: 'eth_requestAccounts' })
//     .then(handleAccountsChanged)
//     .catch((err) => {
//       if (err.code === 4001) {
//         // EIP-1193 userRejectedRequest error
//         // If this happens, the user rejected the connection request.
//         console.log('Please connect to MetaMask.');
//       } else {
//         console.error(err);
//       }
//     });
// }
