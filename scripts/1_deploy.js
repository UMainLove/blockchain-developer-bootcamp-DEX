//this is the deployment file (now is on hardhat local node)
async function main() {

  console.log(`Preparing deployment...\n`)

  //step1: Fetch contracts to deploy
  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')

  //step2: Get accounts
  const accounts = await ethers.getSigners()

  console.log(`Accounts fetched: \n${accounts[0].address}\n${accounts[1].address}\n`)

  //step3: Deploy contracts
  const dapp = await Token.deploy('Dapp University', 'DAPP', '1000000')                               /* DAPP is the symbol for the first token with name, symbol and total supply in the argument of the deploy function */
  await dapp.deployed()
  console.log(`DAPP Token Deployed at: ${dapp.address}`)

  const mETH = await Token.deploy('mock Ether', 'mETH', '1000000')                                    /* mETH is the symbol for the second token */
  await mETH.deployed()
  console.log(`mETH Token Deployed at: ${mETH.address}`)

  const mDAI = await Token.deploy('mock DAI stablecoin', 'mDAI', '1000000')                           /* mDAI is the symbol for the third token */
  await mDAI.deployed()
  console.log(`mDAI Token Deployed at: ${mDAI.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 10)         /* in the argument of the exchange deployment we choose the fee Account and the percentage of the charged fees */
  await exchange.deployed()
  console.log(`Exchange Deployed at: ${exchange.address}`)
}

main()
.then(() => process.exit(0))
  .catch((error) => {
  console.error(error);
  process.exit(1);
});
