import { ethers } from 'ethers';
import TOKEN_ABI from '../ABIs/Token.json';
import EXCHANGE_ABI from '../ABIs/Exchange.json';

export const loadProvider = (dispatch) => {
	const connection = new ethers.providers.Web3Provider(window.ethereum)
    dispatch({ type: 'PROVIDER_LOADED', connection })            /* this function puts the functions inside the store */

	return connection
}

export const loadNetwork = async (provider, dispatch) => {
	const { chainId } = await provider.getNetwork()
    dispatch({ type: 'NETWORK_LOADED', chainId })            /* this function puts the functions inside the store */

	return chainId
}

export const loadAccount = async (provider, dispatch) => {
	const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
	const account = ethers.utils.getAddress(accounts[0])
    dispatch({ type: 'ACCOUNT_LOADED', account })            /* this function puts the functions inside the store */

	let balance = await provider.getBalance(account)
	balance = ethers.utils.formatEther(balance)
	dispatch({ type: 'ETHER_BALANCE_LOADED', balance })

	return account
}

export const loadTokens = async (provider, addresses, dispatch) => {
	let token, symbol
	
	token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
	symbol = await token.symbol()
    dispatch({ type: 'TOKEN_1_LOADED', token, symbol })            /* this function puts the functions of the smart contract inside the store */

	token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
	symbol = await token.symbol()
    dispatch({ type: 'TOKEN_2_LOADED', token, symbol })

	return token
}

export const loadExchange = async (provider, address, dispatch) => {
	const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
    dispatch({ type: 'EXCHANGE_LOADED', exchange }) 

    return exchange
}


export const subscribeToEvents = (exchange, dispatch) => {
  exchange.on('Deposit', (token, user, amount, balance, event) => {
    dispatch({ type: 'TRANSFER_SUCCESS', event })
  })
}


export const loadBalances = async (exchange, tokens, account, dispatch) => {
	/*let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18)
	dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance })

	exchange = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
	dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance })

	balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18)
	dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance })

	exchange = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
	dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance })

}*/

	let token1Balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18)
    dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance: token1Balance })

    let exchangeToken1Balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
    dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance: exchangeToken1Balance })

    let token2Balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18)
    dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance: token2Balance })

    let exchangeToken2Balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
    dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance: exchangeToken2Balance })
}


export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
 
  let transaction

  dispatch({ type: 'TRANSFER_REQUEST' })

  try {
    const signer = await provider.getSigner()
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)

    transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
    await transaction.wait()
    transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)

    await transaction.wait()

  } catch(error) {
    dispatch({ type: 'TRANSFER_FAIL' })
  }
}


