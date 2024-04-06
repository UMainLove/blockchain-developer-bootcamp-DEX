import { useEffect } from 'react';
import { ethers } from 'ethers';
import config from '../config.json';
import TOKEN_ABI from '../ABIs/Token.json';
import EXCHANGE_ABI from '../ABIs/Exchange.json';
import '../App.css';


function App() {
  
  //this function allows an RPC call through the local node of hardhat to get the accounts connected
  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    console.log(accounts[0])

    //connect ethers library to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const { chainId } = await provider.getNetwork()
    console.log(chainId)

    //token smart contract connection to the blockchain
    const token = new ethers.Contract(config[chainId].dapp.address, TOKEN_ABI, provider)
    console.log(token.address)
    const symbol = await token.symbol()
    console.log(symbol)

    //exchange smart contract connection to the blockchain
    const exchange = new ethers.Contract(config[chainId].exchange.address, EXCHANGE_ABI, provider)
    console.log(exchange.address)
    
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

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
