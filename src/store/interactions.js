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
    dispatch({ type: 'TOKEN_1_LOADED', token, symbol })            /* this function puts the functions inside the store */

	token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
	symbol = await token.symbol()
    dispatch({ type: 'TOKEN_2_LOADED', token, symbol })

	return token
}

export const loadExchange = async (provider, address, dispatch) => {
	const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
    dispatch({ type: 'EXCHANGE_LOADED', exchange }) 

    return exchange
}