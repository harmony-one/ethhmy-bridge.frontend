import { IStores } from "stores";
import Web3 from 'web3';

declare global {
  interface Window {
    stores?: IStores;
    web3?: Web3;
  }
}
