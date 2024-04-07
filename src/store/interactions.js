import { ethers } from 'ethers';
import TOKEN_ABI from '../ABIs/Token.json';

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

export const loadAccount = async (dispatch) => {
	const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
	const account = ethers.utils.getAddress(accounts[0])
    dispatch({ type: 'ACCOUNT_LOADED', account })            /* this function puts the functions inside the store */

	return account
}

export const loadToken = async (provider, address, dispatch) => {
	let token, symbol
	token = new ethers.Contract(address, TOKEN_ABI, provider)
	symbol = await token.symbol()
    dispatch({ type: 'TOKEN_LOADED', token, symbol })            /* this function puts the functions inside the store */

	return token
}