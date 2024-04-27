//THIS IS THE WORKFLOW DESCRIPTION
//smart contract functionalities available tu use(solidity files)->smart contract functions delivered to the blockchain to be executed(interactions.js)->registering every action made on blockchain by users on a web server(reducers.js)->showing the updates of the register and call every possible action action in the application (selectors.js)->providing the user interface structure updated in real time (app.js)->creating the user interface widgets to directly interact with the application(every file available in components folder)




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
        contracts: [action.token],
        symbols: [action.symbol]
      }
    case 'TOKEN_1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance]
      }
    case 'TOKEN_2_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.token],
        symbols: [...state.symbols, action.symbol]
      }
    case 'TOKEN_2_BALANCE_LOADED':
      return {
        ...state,
        balances: [...state.balances, action.balance]
      }

      default:
        return state
  }
}

const DEFAULT_EXCHANGE_STATE = {
  loaded: false,
  contract: {},
  transaction: {
    isSuccessful: false
  },
  allOrders: {
    loaded: false,
    data: []
  },
  events: []
}

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {   
  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.exchange
      }
    case 'CANCELLED_ORDERS_LOADED':
      return {
        ...state,
        cancelledOrders: {
          loaded: true,
          data: action.cancelledOrders
        }
      }
    case 'FILLED_ORDERS_LOADED':
      return {
        ...state,
        filledOrders: {
          loaded: true,
          data: action.filledOrders
        }
      }
    case 'ALL_ORDERS_LOADED':
      return {
        ...state,
        allOrders: {
          loaded: true,
          data: action.allOrders
        }
      }
    case 'ORDER_CANCEL_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'Cancel',
          isPending: true,
          isSuccessful: false
        }
      }
    case 'ORDER_CANCEL_SUCCESS':
      return {
        ...state,
        transaction: {
          transactionType: 'Cancel',
          isPending: false,
          isSuccessful: true
        },
        cancelledOrders: {
          ...state.cancelledOrders,
          data: [
            ...state.cancelledOrders.data,
            action.order
          ]
        },
        events: [action.event, ...state.events]
      }
    case 'ORDER_CANCEL_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'Cancel',
          isPending: false,
          isSuccessful: false,
          isError: true
        }
      }
    case 'EXCHANGE_TOKEN_1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance]
      }
    case 'EXCHANGE_TOKEN_2_BALANCE_LOADED':
      return {
        ...state,
        balances: [...state.balances, action.balance]
      }
    case 'TRANSFER_REQUEST':
      return {
        ...state,
        trasnsaction: {
          transactionType: 'Transfer',
          isPending: true,
          isSuccessful: false
        },
        transferInProgress: true
      }
    case 'TRANSFER_SUCCESS':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccessful: true
        },
        transferInProgress: false,
        events: [action.event, ...state.events]
      }
    case 'TRANSFER_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccessful: false,
          isError: true
        },
        transferInProgress: false
      }
    case 'NEW_ORDER_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: true,
          isSuccessful: false
        },
      }
    case 'NEW_ORDER_SUCCESS':
      //prevent duplicate orders
      let index = state.allOrders.data.findIndex(order => order.id.toString() === action.order.id.toString())
      let data
      if(index === -1) {
        data = [...state.allOrders.data, action.order]
      } else {
        data = state.allOrders.data
      }
      return {
        ...state,
        allOrders: {
          ...state.allOrders,
            data
        },
        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccessful: true,
          isError: false
        },
        events: [action.event, ...state.events]
      }
    case 'NEW_ORDER_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccessful: false,
          isError: true
        },
      }

      default:
        return state
  }
}