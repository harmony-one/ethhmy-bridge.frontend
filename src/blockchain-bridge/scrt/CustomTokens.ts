import { SwapToken } from '../../pages/Swap/types/SwapToken';

const LOCAL_STORAGE_KEY = 'SwapLocalStorageTokensNew';

const setLocalStorage = item => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(item));
const getLocalStorage = () => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

class LocalStorageTokens {
  static store(token: SwapToken) {
    let tokens: SwapToken[] = LocalStorageTokens.get();

    tokens = tokens.concat(token);

    setLocalStorage(tokens);
    window.dispatchEvent(new Event('storage'));
  }

  static get(): SwapToken[] {
    try {
      return getLocalStorage() || [];
    } catch {
      return [];
    }
  }

  static clear() {
    setLocalStorage({});
    window.dispatchEvent(new Event('updatePairsAndTokens'));
  }
}

export default LocalStorageTokens;
