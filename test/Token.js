const { ethers } = require('hardhat'); /* here we're taking the hardhat library inside this file and using the ethers functions. ethers in fact it's not a var because it's destructured by the {...} */
const { expect } = require('chai'); /* we do the same as the hardhat with the chai library */

const tokens = (n) => {                                        /* >>>>>>>this is a variable called "tokens" that calls a function (defined in "n") that has another function inside. */
	return ethers.utils.parseUnits(n.toString(), 'ether')      /* this function use the ethers library and picks up the parseUnit (used to convert a number into a mesure unit of ethereum, in this case is ether) and the variable argument is picked up by the function toString */
}

describe('Token', () => { /* here we're describing the functions that have to be tested assuming this file is an automated user interaction with the smart contract. The name in "..." is the name of the smart contract*/
	

	/*        tests go inside here...       */


let token, accounts, deployer, receiver, exchange   /* this allow us to use these variables in every test function */


	beforeEach(async () => { /* first beforeEach */
	
	/* fetch the token from the blockchain so we can avoid it from duplicate code in each functions below */

		const Token = await ethers.getContractFactory('Token')                                          /* first we call the smart contract */
		token = await Token.deploy('Dapp University', 'DAPP', '1000000')                                /* then we wait to be deployed */

		accounts = await ethers.getSigners()                                    /* >>>>>>>>this function from ehters library allow us to retrieve the accounts and is assigned to the "accounts" var */
		deployer = accounts[0]               /* here we're trying to get the first account from the hardhat node in the "deployer" var */
		receiver = accounts[1]               /* here we're trying to get the second account from the hardhat node in the "receiver" var */
		exchange = accounts[2]               /* here we're trying to get the third account from the hardhat node in the "exchange" var */
	})


 describe('Deployment', () => {                  /* >>>>>>here we define first the main variable that has to be called in the tests */

	const name = 'Dapp University'
	const symbol = 'DAPP'
	const decimals = '18'
	const totalSupply = tokens('1000000')


	it('has correct name', async () => {                /* >>>>>>here there's the function that shows the name of the token */

	/* step 1. fetch the token from the blockchain (we did it in the first "beforeEach" function) */
		
	/* step 2. read the token name */
		//const name = await token.name()

	/* step 3. check the name that is correct */
		//expect(name).to.equal('Dapp University')

		/* now we put step2 and step3 in the same function (the previous steps' line are commented) */
		expect(await token.name()).to.equal(name)
	})


	it('has correct symbol', async () => {               /* >>>>>>here there's the function that shows the symbol of the token */

	/* step 1. fetch the token from the blockchain (we did it in the first "beforeEach" function) */
		
	/* step 2. read the token symbol */
		//const symbol = await token.symbol()          

	/* step 3. check the symbol that is correct */
		//expect(symbol).to.equal('DAPP')

		/* now we put step2 and step3 in the same function (the previous steps' line are commented) */
		expect(await token.symbol()).to.equal(symbol)
	})


	it('has correct decimals', async () => {           /* >>>>>>here there's the function that shows the decimals of the token */

		expect(await token.decimals()).to.equal(decimals)
	})


	it('has correct total supply', async () => {           /* >>>>>>here there's the function that shows the decimals of the token */

		//const value = ethers.utils.parseUnits('1000000', 'ether')  /* here we use a function from utility's ether library that convert a number in the unit mesure we want */
		//expect(await token.totalSupply()).to.equal(value)          /* so in the chai test we're gonna use the 'value' variable which contains the right number */

				/* we can make the code in this function shorter than this 2 lines above by adding a variable that calls a function outsde the main (at the top of the file) */


		expect(await token.totalSupply()).to.equal(totalSupply)  /* according to the description of the function "tokens" outside the main, here we just need to call the var (that becomes a function and pass the value that is the argument which is "n") and the number we want to use */
	})

	it('assings total supply to deployer', async () => {     /* this is the function that tests the ownership of the token by using the balance of accounts that hold the tokens (it's a balance checker) */
		expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)     /* "deployer" it's the var from first "beforeEach" function. "Address" need to be specified to avoid error because the mapping in the solidity file assign the balance specifically to an address and not generically to an account */
	})
 })

 describe('Sending Tokens', () => {
 	
 	let amount, transaction, result                 /* these var are used in this function to chose the amount to transfer */

  describe('Success', () => {  /* grouping the functions for transaction results */

 		beforeEach( async () => {  /* second before each */

 	/* step1. transfer tokens */
		amount = tokens(100) /* the chosen amount for this test example */
 		transaction = await token.connect(deployer).transfer(receiver.address, amount) /* >>>>>>>in this var 'transaction' we use a function that connects the the deployer wallet to the token smart contract deployed on chain. Then we transfer the token to the receiver ADDRESS already defined before in the first "beforeEach" function and choose an amount (in this example case is 100). REMEMBER THAT THE ADDRESS PROPRETY IS A CALL FROM "ETHERS" LIBRARY SO WE'RE NOT DEFINING EXPLICITLY THE ADDRESS BUT JUST THE ACCOUNTS */
 		result = await transaction.wait() /* here we wait for the transaction to be executed in the blockchain and get a result in the 'result' var */
 		
 	})

 	it('transfers token balances', async () => {
 		
 	/* log balance before sending (This is just made to explictly see it in the console of hardat node) */
 		console.log("Deployer balance before transfer", await token.balanceOf(deployer.address))
 		console.log("Receiver balance before transfer", await token.balanceOf(receiver.address))

 		/* step2. ensure that tokens were transfered (balance changed) */
		expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))  /* here we have the new total amount of the sender defined before (1000000 - 100) */
 		expect(await token.balanceOf(receiver.address)).to.equal(amount)          /* here we have the new total amount of the receiver that we don't know so we use the local var defined at the top of "Sending Tokens" describer */
 	
 	/* log balance after sending (This is just made to explictly see it in the console of hardat node) */
 		console.log("Deployer balance after transfer", await token.balanceOf(deployer.address))
 		console.log("Receiver balance after transfer", await token.balanceOf(receiver.address))

 	})

 	it('emits a Transfer event', async () => {         /* here we have the test function for the emission of the events in the transfer function written in the soldity file */
 		const event = result.events[0]
 		expect(event.event).to.equal('Transfer')

 		const args = event.args
		expect(args.from).to.equal(deployer.address)
 		expect(args.to).to.equal(receiver.address)
 		expect(args.value).to.equal(amount)
 	})

  })

 describe('Failure', () => { /* grouping the functions for transaction results */

  it('rejects insufficient balance', async () => {

  	/* transfer more token than smart contract deployer amount -100M */
  	const invalidAmount = tokens(100000000)
  	await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
	})
    
    /* transfer token to a random address (0x000...) that non exists */
  it('rejects invalid recipient', async () => {
  	const amount = tokens(100) /* the amount is optional here */
  	await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
  })

  
 })

 	
 })

 describe('Approving Tokens', () => {

 	let amount, transaction, result                 /* these var are used in this function to chose the amount to approve */


 	beforeEach(async () => {
 		amount = tokens(100) /* the chosen amount for this test example */
 		transaction = await token.connect(deployer).approve(exchange.address, amount) /* >>>>>>>in this var 'transaction' we use a function that connects the the deployer wallet to the token smart contract deployed on chain. Then we approve the token to the exchange ADDRESS already defined before in the first "beforeEach" function and choose an amount (in this example case is 100). REMEMBER THAT THE ADDRESS PROPRETY IS A CALL FROM "ETHERS" LIBRARY SO WE'RE NOT DEFINING EXPLICITLY THE ADDRESS BUT JUST THE ACCOUNTS */
 		result = await transaction.wait() /* here we wait for the transaction to be executed in the blockchain and get a result in the 'result' var */
 		
 	})
 	
 	describe('Success', () => {
 		it('allocates an allowance for delegated token spending', async () => {
 			expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)  /* this is the test for the success of token approval. 'Allowance' is from the solidity file because needs a separate function for token approval */
 		})

 		it('emits an Approval event', async () => {         /* here we have the test function for the emission of the events in the approval function written in the soldity file */
 		const event = result.events[0]
 		expect(event.event).to.equal('Approval')

 		const args = event.args
		expect(args.owner).to.equal(deployer.address)
 		expect(args.spender).to.equal(exchange.address)
 		expect(args.value).to.equal(amount)
 		})
 	})

 	describe('Failure', () => {
 		it('rejects invalid spender', async () => {
 			await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
 		})
 	})
 })



 describe('Delegated Tokens Transfer', () => {

 	let amount, transaction, result                 /* these var are used in this function to chose the amount to approve */

 	beforeEach(async () => {
 		amount = tokens(100) /* the chosen amount for this test example */
 		transaction = await token.connect(deployer).approve(exchange.address, amount) /* >>>>>>>in this var 'transaction' we use a function that connects the the deployer wallet to the token smart contract deployed on chain. Then we approve the token to the exchange ADDRESS already defined before in the first "beforeEach" function and choose an amount (in this example case is 100). REMEMBER THAT THE ADDRESS PROPRETY IS A CALL FROM "ETHERS" LIBRARY SO WE'RE NOT DEFINING EXPLICITLY THE ADDRESS BUT JUST THE ACCOUNTS */
 		result = await transaction.wait() /* here we wait for the transaction to be executed in the blockchain and get a result in the 'result' var */
 		
 	})

 	describe('Success', () => {
 		beforeEach(async () => {
 		transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount) /* >>>>>>>in this var 'transaction' we use a function that connects the the exchange address that has been used to approve the transfer function. We connect also the deployer and the receiver addresses to let spend token in its behalf through the 'transferFrom' function. */
 		result = await transaction.wait() /* here we wait for the transaction to be executed in the blockchain and get a result in the 'result' var */
 		
 	})
 		it('transfers token balance', async () => {
 			expect(await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits("999900", "ether"))
 			expect(await token.balanceOf(receiver.address)).to.be.equal(amount)
 		})

 		it('resets the allowance', async () => {
 			expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0)
 		})

 		it('emits a Transfer event', async () => {         /* here we have the test function for the emission of the events in the delegated transfer function written in the soldity file */
 		const event = result.events[0]
 		expect(event.event).to.equal('Transfer')

 		const args = event.args
		expect(args.from).to.equal(deployer.address)
 		expect(args.to).to.equal(receiver.address)
 		expect(args.value).to.equal(amount)
 		})
 	})

 	describe('Failure', () => {
 		it('Rejects insufficient amounts', async () => {
		const invalidAmount = tokens(100000000)
		await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
		})
 	})
 })
})
