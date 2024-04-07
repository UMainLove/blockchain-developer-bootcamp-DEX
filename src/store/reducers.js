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
        connection: action.chainId
      }
    case 'ACCOUNT_LOADED':
      return {
        ...state,
        connection: action.account
      }
    case 'TOKEN_LOADED':
      return {
        ...state,
        connection: action.token
      }

      default:
        return state
  }
}

export const tokens = (state = { loaded: false, contract: null }, action) => {   /*'export' allows to import the states from other files */
  switch (action.type) {
    case 'TOKEN_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.token,
        symbol: action.symbol
      }

      default:
        return state
  }
}
