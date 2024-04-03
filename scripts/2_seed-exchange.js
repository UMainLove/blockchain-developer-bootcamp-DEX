// We require the Hardhat Runtime Environment explicitly here. This is optional          |||||||||||||||||||||||||||
// but useful for running the script in a standalone fashion through `node <script>`.    vvvvvvvvvvvvvvvvvvvvvvvvvvv
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

/* const hre = require("hardhat"); */  //<<<<<<<< this line is for " node run scripts/2_seed-exchange.js " instead of the classic npx hardhat...

const config = require('../src/config.json')    /* using the config.json file ensures to use every time the same addresses for the tokens and the exchange on the hardhat node */

const tokens = (n) => { 
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {                                            /* this function allows to set a fixed amount of waiting time for each transaction to be completed */
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}


async function main() {
  
  //fetch accounts from wallet 
  const accounts = await ethers.getSigners()

  const { chainId } = await ethers.provider.getNetwork()   /* with this function we get the chain ID of the harhat local node. This number represents is the first line of code in the "config.json" file */
  console.log('Using chainId:', chainId)

  const dapp = await ethers.getContractAt('Token', config[chainId].dapp.address)     /* here we have the contract address after hitting: npx hardhat run --network localhost scripts/1_deploy.js */
  console.log(`DAPP Token Fetched at: ${dapp.address}\n`)

  const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)     /* >>>>>>>>>>>>>> usually the first argument and the second argument for the "getContractAt()" are the name of the solidity file and the exact address when deployed on chain, now, with config.json file it's possible to retrieve the addresses in this way */
  console.log(`mETH Token Fetched at: ${mETH.address}\n`)

  const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
  console.log(`mDAI Token Fetched at: ${mDAI.address}\n`)

  const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
  console.log(`Exchange Fetched at: ${exchange.address}\n`)



//-------------------------------------testing-on-chain---------------------------->
  //give tokens to account 1
  const sender = accounts[0]
  const receiver = accounts[1]
  let amount = tokens(10000)

  let transaction = await mETH.connect(sender).transfer(receiver.address, amount)                 /* transferring mETH... */
  console.log(`Transferred ${amount}, tokens from ${sender.address} to ${receiver.address}\n`)


  //set up exchange users
  const user1 = accounts[0]
  const user2 = accounts[1]
  amount = tokens(10000)

  transaction = await dapp.connect(user1).approve(exchange.address, amount)                 /* approving DAPP... */
  result = await transaction.wait()
  console.log(`Approved ${amount}, tokens from ${user1.address}\n`)

  transaction = await exchange.connect(user1).depositToken(dapp.address, amount)            /* depositing DAPP to exchange... */
  result = await transaction.wait()
  console.log(`Deposited ${amount}, tokens from ${user1.address}\n`)

  transaction = await mETH.connect(user2).approve(exchange.address, amount)                 /* approving mETH... */
  result = await transaction.wait()
  console.log(`Approved ${amount}, tokens from ${user2.address}\n`)

  transaction = await exchange.connect(user2).depositToken(mETH.address, amount)            /* depositing mETH to exchange... */
  result = await transaction.wait()
  console.log(`Deposited ${amount}, tokens from ${user2.address}\n`)

  //make orders
  let orderId
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), dapp.address, tokens(5))  /* user 1 placed it */
  result = await transaction.wait()
  console.log(`An order is made from: ${user1.address}\n`)

  //cancel orders
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)                                              /* user 1 deleted it */
  result = await transaction.wait()
  console.log(`Order deleted from: ${user1.address}\n`)

  //waiting time (1 second)
  await wait(1)

  //fill orders 
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), dapp.address, tokens(10))   /* step1: user 1 makes a new order */
  result = await transaction.wait()
  console.log(`An order is made from: ${user1.address}\n`)

  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)                                                   /* step2: user 2 accepts the order */
  result = await transaction.wait()
  console.log(`Order made from: ${user1.address} is accepted\n`)

  //waiting time (1 second)
  await wait(1)

  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), dapp.address, tokens(15))    /* step3: user 1 makes another order */
  result = await transaction.wait()
  console.log(`An order is made from: ${user1.address}\n`)

  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)                                                   /* step4: user 2 accepts another order */
  result = await transaction.wait()
  console.log(`Order made from: ${user1.address} is accepted\n`)

  //waiting time (1 second)
  await wait(1)

  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), dapp.address, tokens(20))   /* step5: user 1 makes a third order */
  result = await transaction.wait()
  console.log(`An order is made from: ${user1.address}\n`)

  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)                                                   /* step6: user 2 accepts the third order */
  result = await transaction.wait() 
  console.log(`Order made from: ${user1.address} is accepted\n`)

  //waiting time (1 second)
  await wait(1)

  //user1 makes 10 orders
  for(let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), dapp.address, tokens(10))
    result = await transaction.wait()
    console.log(`An order is made from: ${user1.address}\n`)

    //waiting time (1 second)
    await wait(1)
  } 
  
  //user2 makes 10 orders
  for(let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user2).makeOrder(dapp.address, tokens(10), mETH.address, tokens(10 * i))
    result = await transaction.wait()
    console.log(`An order is made from: ${user2.address}\n`)

    //waiting time (1 second)
    await wait(1)
  } 
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
  .catch((error) => {
  console.error(error);
  process.exit(1);
});
