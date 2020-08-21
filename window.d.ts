import { IStores } from "stores";

declare global {
  interface Window {
    stores?: IStores;
    BASE_URL?: string;
  }
}
