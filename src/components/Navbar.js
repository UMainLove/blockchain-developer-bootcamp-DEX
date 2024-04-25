
import { useSelector, useDispatch } from 'react-redux'

import Blockies from 'react-blockies'

import logo from '../assets/logo.png'
import eth from '../assets/eth.svg'

import { loadAccount } from '../store/interactions'

import config from '../config.json';

const Navbar = () => {

	const provider = useSelector(state => state.provider.connection)
	const chainId = useSelector(state => state.provider.chainId)
	const account = useSelector(state => state.provider.account)   /* the state of this function is retrieved from Redux devTool in chrome browser. the address of the account is in the path specified by the argument of this function 'state.provider.account' */
	const balance = useSelector(state => state.provider.balance)
	
	const dispatch = useDispatch()

	const connectHandler = async () => {
		
		//this function loads the account after the click on the 'connect' button
		await loadAccount(provider, dispatch)
	}

	const networkHandler = async (e) => {

		//this function loads the slection menu to change the various networks
		await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: e.target.value }],
      })
	} 

	return (
		<div className='exchange__header grid'>
      <div className='exchange__header--brand flex'>
      	<img src={logo} className = "logo" alt = "Dapp logo"></img>
      	<h1>Decentralized Token Exchange</h1>
      </div>

      <div className='exchange__header--networks flex'>
      	<img src={eth} alt="ETH Logo" className='Eth Logo' />


      	{chainId && (
      	<select name="networks" id="networks" value={config[chainId] ? `0x${chainId.toString(16)}` : `0`} onChange={networkHandler}>
      		<option value="0" disabled>Select Network</option>
      		<option value="0x7A69">Localhost</option>
            <option value="0xaa36a7">Sepolia</option>
      	</select>
      	)}

      </div>

      <div className='exchange__header--account flex'>
      	{balance ? (
      	  <p><small>My Balance</small>{Number(balance).toFixed(4)}</p>
      	) : (
      	  <p><small>My Balance</small>0 ETH</p>
      	  )}
        
      	{account ? (
      	  <a 
      	  	href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : `#`}
      	  	target='_blank'
      	  	rel='noreferrer'
      	  >
      	  {account.slice(0,5) + '...' + account.slice(38,42)}
      	  <Blockies
      	   seed={account}
      	   size={10} 
      	   scale={3}
      	   color="#dfe"
      	   bgColor="#ffe"
      	   spotColor="#abc"
      	  	account={account}
      	  	className="identicon"
      	  /> 
      	  </a>
      	) : ( 
      	  <button className="button" onClick={connectHandler}>Connect</button> 
        )}

      </div>
    </div>
	)
}

export default Navbar;