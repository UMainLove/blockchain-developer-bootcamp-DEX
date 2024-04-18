import { useEffect } from 'react';
import { useDispatch } from 'react-redux';                                  /* this library is imported to use the 'dispatch' function */
import config from '../config.json';

import {
 loadProvider,
 loadNetwork,
 loadAccount,
 loadTokens,
 loadExchange,
 subscribeToEvents
   } from '../store/interactions';

import Navbar from './Navbar'
import Markets from './Markets'
import Balance from './Balance'
import Order from './Order'

function App() {
  
  const dispatch = useDispatch()                                           /* a variable triggers the dispatch function */

  //this function allows an RPC call through the local node of hardhat to get the accounts connected
  const loadBlockchainData = async () => {
    
   //connect ethers library to blockchain
    const provider = loadProvider(dispatch)

    //fetch current network chainId
    const chainId = await loadNetwork(provider, dispatch)

    //reload page when network changes
    window.ethereum.on('chainChanged', () => {

      window.location.reload()
    })

    //fetch current account and balance from metamask and change it if there's another account selected
    window.ethereum.on('accountsChanged', () => {

      loadAccount(provider, dispatch)
    })  
     
    //token smart contract connection to the blockchain
    const dapp = config[chainId].dapp
    const mETH = config[chainId].mETH
    await loadTokens(provider, [dapp.address, mETH.address], dispatch)

    //exchange smart contract connection to the blockchain
    const exchangeConfig = config[chainId].exchange 
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)
    
    subscribeToEvents(exchange, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          < Markets />

          < Balance />

          < Order />

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
