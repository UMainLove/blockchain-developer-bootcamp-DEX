const { ethers } = require('hardhat');
const { expect } = require('chai');

const tokens = (n) => { 
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Exchange', () => {

	let deployer, feeAccount, exchange

	const feePercent = 10                                                  /* this is the value choosen for the Exchange fees as a global var */

	beforeEach(async () => {

		const Exchange = await ethers.getContractFactory('Exchange')
		const Token = await ethers.getContractFactory('Token')             /* we import Token contract also in the test */

		token1 = await Token.deploy('Dapp University', 'DAPP', '1000000')			   /* we could have more than a token in the exchange so this is token1 */

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]										   /* this is the address where the fees got paid */
		user1 = accounts[2]												   /* we could have more than a user also */

		let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100)) /* we assign 100 tokens to the user1 at deployment time because so it's possible to continue the depositing test */
		await transaction.wait()

		exchange = await Exchange.deploy(feeAccount.address, feePercent) /* the smart contract is deployed... */

	})


	describe('Deployment', () => {

		it('tracks the fee account', async () => {
			expect(await exchange.feeAccount()).to.equal(feeAccount.address)     /* checking if the fee account is working */
		})

		it('tracks the fee percent', async () => {
			expect(await exchange.feePercent()).to.equal(feePercent)            /* checking if the percentage of fees is correct */
		})
	})

	describe('Depositing tokens', () => {
		
		let transaction, result
		let amount = tokens(10)                                  /* 10 tokens are assigned to be used in the transaction test */

		

		describe('Success', () => {

			beforeEach(async () => {

		//approve token
		transaction = await token1.connect(user1).approve(exchange.address, amount)
		result = await transaction.wait()         /* wait for the finish of the transaction */

		//deposit tokens
		transaction = await exchange.connect(user1).depositToken(token1.address, amount)
		result = await transaction.wait()        /* check for the result of the transaction */
	})
			it('tracks the token deposit', async () => {
				expect(await token1.balanceOf(exchange.address)).to.equal(amount)
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
			})

			it('emits a Deposit event', async () => {
				const event = result.events[1] //2 events are emitted
 				expect(event.event).to.equal('Deposit')

 				const args = event.args
				expect(args.token).to.equal(token1.address)
 				expect(args.user).to.equal(user1.address)
 				expect(args.amount).to.equal(amount)
 				expect(args.balance).to.equal(amount)

			})
		})
		
		describe('Failure', () => {
			it('fails when no tokens are approved', async () => {
				//don't approve any tokens before depositing
				await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
			})
		})
	})

})