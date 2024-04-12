//this functions allows to connect the actions made on the exchange to use the smart contract functions through state variables that are stored constantly in the database(->store.js) and get updated at every new action
export const provider = (state = {}, action) => {   /*'export' allows to import the states from other files */
  switch (action.type) {
    case 'PROVIDER_LOADED':
      return {
      ...state,                                    /* '...' create a copy of the current 'state' that has to be modified by a new action */ 
        connection: action.connection
      }
    case 'NETWORK_LOADED':
      return {
        ...state,
        chainId: action.chainId
      }
    case 'ACCOUNT_LOADED':
      return {
        ...state,
        account: action.account
      }
    case 'ETHER_BALANCE_LOADED':
      return {
        ...state,
        balance: action.balance
      }

      default:
        return state
  }
}

const DEFAULT_TOKENS_STATE = { 
loaded: false, 
contracts: [], 
symbols: [] 
}

export const tokens = (state = DEFAULT_TOKENS_STATE, action) => {   /*'export' allows to import the states from other files */
  switch (action.type) {
    case 'TOKEN_1_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.token],
        symbols: [...state.symbols, action.symbol]
      }
    case 'TOKEN_2_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.token],
        symbols: [...state.symbols, action.symbol]
      }

      default:
        return state
  }
}



export const exchange = (state = { loaded: false, contract: {} }, action) => {   
  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.exchange
      }

      default:
        return state
  }
}