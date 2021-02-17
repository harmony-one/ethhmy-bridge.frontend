import { TokenDisplay } from '../../pages/Swap';

const LOCAL_STORAGE_KEY = 'SwapLocalStorageTokens';

const setLocalStorage = item => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(item));
const getLocalStorage = () => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

class LocalStorageTokens {
  static store(token: TokenDisplay) {
    let tokens: Record<string, TokenDisplay> | null = getLocalStorage();

    // todo: handle overwriting tokens with the same symbol
    if (!tokens) {
      tokens = {};
    }
    tokens[token.symbol] = token;

    setLocalStorage(tokens);
    window.dispatchEvent(new Event('storage'));
  }

  static get(): Record<string, TokenDisplay> | null {
    try {
      return getLocalStorage();
    } catch {
      return null;
    }
  }

  static clear() {
    setLocalStorage({});
    window.dispatchEvent(new Event('updatePairsAndTokens'));
  }
}

export default LocalStorageTokens;
