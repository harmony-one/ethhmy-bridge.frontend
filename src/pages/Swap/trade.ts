export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP
}

export interface TokenInfo {
  symbol: string;
  address?: string;
  token_code_hash?: string;
}

export interface Token {
  type: 'token';
  token: {
    contract_addr: string
    token_code_hash: string;
    viewing_key: string;
  };
}

export interface NativeToken {
  type: 'native_token';
  native_token: {
    denom: string
  };
}

export class Currency {
  public readonly amount: string
  public readonly token: Asset  // todo: replace with bech32

  isEqualToIdentifier(info: string) {
    return this.token.info.type === 'native_token' ?
      this.token.info.native_token.denom === info :
      this.token.info.token.contract_addr === info;
  }

  constructor(token: Asset, amount: string) {
    this.amount = amount;
    this.token = token;
  }
}

export class Asset {
  public info: Token | NativeToken
  public symbol: string;

  public isNative(): this is NativeToken {
    return Asset._isNative(this.info)
  };

  private static _isNative(info: any): info is NativeToken {
    return 'native_token' in info;
  }

  static fromTokenInfo(token: TokenInfo): Asset {
    if (token.address) {
      return new Asset(token.symbol, {
        type: 'token',
        token: {
        contract_addr: token.address,
          token_code_hash: token.token_code_hash,
          viewing_key: ""
      }});
    } else {
      return new Asset(token.symbol, {
        type: 'native_token',
        native_token: { denom: `u${token.symbol.toLowerCase()}`
        }
      });
    }
  };

  constructor(symbol: string, info: Token | NativeToken) {
    this.info = info;
    this.symbol = symbol;
  }

}

export class Trade {
  /**
   * The route of the trade, i.e. which pairs the trade goes through.
   */
  //public readonly route: Route
  /**
   * The type of the trade, either exact in or exact out.
   */
  //public readonly tradeType: TradeType
  /**
   * The input amount for the trade assuming no slippage.
   */
  public readonly inputAmount: Currency
  /**
   * The output amount for the trade assuming no slippage.
   */
  public readonly outputAmount: Currency
  /**
   * The price expressed in terms of output amount/input amount.
   */
  //public readonly executionPrice: number
  /**
   * The mid price after the trade executes assuming no slippage.
   */
  public readonly price: number
  /**
   * The percent difference between the mid price before the trade and the trade execution price.
   */
  //public readonly priceImpact: number

  //public readonly pair: string

  constructor(inputAmount: Currency, outputAmount: Currency, price: number ) {
    this.inputAmount = inputAmount;
    this.outputAmount = outputAmount;
    this.price = price;
    //this.executionPrice = Number(outputAmount.amount) / Number(inputAmount.amount);
    //this.priceImpact = calculatePriceImpact(this.midPrice, this.inputAmount, this.outputAmount)
  }
}
