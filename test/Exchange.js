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
		token2 = await Token.deploy('Mock Dai', 'mDAI', '1000000')					   /* this is a sample of the secon token available in the exchange and refers to a copy of the DAI stablecoin */


		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]										   /* this is the address where the fees got paid */
		user1 = accounts[2]												   /* we could have more than a user also */
		user2 = accounts[3]												   /* this account is used in the cancel order section */

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


	describe('Withdrawing tokens', () => {
		
		let transaction, result
		let amount = tokens(10)                                  /* 10 tokens are assigned to be used in the transaction test */

		

		describe('Success', () => {

			beforeEach(async () => {

		//deposit tokens before withdrawing

		//approve token
		transaction = await token1.connect(user1).approve(exchange.address, amount)
		result = await transaction.wait()         /* wait for the finish of the transaction */

		//deposit tokens
		transaction = await exchange.connect(user1).depositToken(token1.address, amount)
		result = await transaction.wait()        /* check for the result of the transaction */

		//withdraw tokens
		transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
		result = await transaction.wait()
	})
			it('withdraws token funds', async () => {
				expect(await token1.balanceOf(exchange.address)).to.equal(0)
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
			})

			it('emits a Withdraw event', async () => {
				const event = result.events[1] //2 events are emitted
 				expect(event.event).to.equal('Withdraw')

 				const args = event.args
				expect(args.token).to.equal(token1.address)
 				expect(args.user).to.equal(user1.address)
 				expect(args.amount).to.equal(amount)
 				expect(args.balance).to.equal(0)

			})
		})
		
		describe('Failure', () => {
			it('fails for insufficient balance', async () => {
				//attempt to withdraw tokens without depositing
				await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
			})
		})
	})


	describe('Checking balances', () => {
		
		let transaction, result
		let amount = tokens(1)                                  /* 1 token is assigned to be used in the balance checking test */

		
		beforeEach(async () => {

		//approve token
		transaction = await token1.connect(user1).approve(exchange.address, amount)
		result = await transaction.wait()         /* wait for the transaction's end */

		//deposit tokens
		transaction = await exchange.connect(user1).depositToken(token1.address, amount)
		result = await transaction.wait()        /* check for the result of the transaction */

		})
			it('returns user balance', async () => {
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
			})
	})


	describe('Making orders', async () => {

		let transaction, result

		let amount = tokens(1)    /* in this test we make an order 1:1 so 1 token to give and 1 token to get */

		describe('Success', async () => {
			beforeEach(async () => {

		//deposit tokens before making order

		//approve token
		transaction = await token1.connect(user1).approve(exchange.address, amount)
		result = await transaction.wait()         /* wait for the finish of the transaction */

		//deposit tokens
		transaction = await exchange.connect(user1).depositToken(token1.address, amount)
		result = await transaction.wait()        /* check for the result of the transaction */

		//make order
		transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)   
		result = await transaction.wait()
			})

			it('tracks the newly created order', async () => {
				expect(await exchange.orderCount()).to.equal(1)
			})

			it('emits an order event', async () => {
				const event = result.events[0] 
 				expect(event.event).to.equal('Order')

 				const args = event.args
				expect(args.id).to.equal(1)
 				expect(args.user).to.equal(user1.address)
 				expect(args.tokenGet).to.equal(token2.address)
 				expect(args.amountGet).to.equal(tokens(1))
 				expect(args.tokenGive).to.equal(token1.address)
 				expect(args.amountGive).to.equal(tokens(1))
 				expect(args.timestamp).to.at.least(1)
			})
		})

		describe('Failure', async () => {
			it('rejects orders with no balance', async () => {
				await expect(exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))).to.be.reverted
			})

		})
	})


	describe('Order actions', async () => {

		let transaction, result

		let amount = tokens(1)    /* in this test we make an order 1:1 so 1 token to give and 1 token to get */

		beforeEach(async () => {
			
			//approve tokens
			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = await transaction.wait()         /* wait for the finish of the transaction */

			//deposit tokens
			transaction = await exchange.connect(user1).depositToken(token1.address, amount)
			result = await transaction.wait()        /* check for the result of the transaction */

			//make order
			transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)   
			result = await transaction.wait()
		})

		describe('Cancelling orders', async () => {

			describe('Success', async () => {
				
				beforeEach(async () => {
					transaction = await exchange.connect(user1).cancelOrder(1)
					result = await transaction.wait()
				})

				it('Updates cancelled orders', async () => {
					expect(await exchange.orderCancelled(1)).to.equal(true)
				})

				it('Emits a cancel event', async () => {
				const event = result.events[0] 
 				expect(event.event).to.equal('Cancel')

 				const args = event.args
				expect(args.id).to.equal(1)
 				expect(args.user).to.equal(user1.address)
 				expect(args.tokenGet).to.equal(token2.address)
 				expect(args.amountGet).to.equal(tokens(1))
 				expect(args.tokenGive).to.equal(token1.address)
 				expect(args.amountGive).to.equal(tokens(1))
 				expect(args.timestamp).to.at.least(1)
 			    })
			})
				
		

			describe('Failure', async () => {

				beforeEach(async () => {
					//approve tokens
					transaction = await token1.connect(user1).approve(exchange.address, amount)
					result = await transaction.wait()         /* wait for the finish of the transaction */

					//deposit tokens
					transaction = await exchange.connect(user1).depositToken(token1.address, amount)
					result = await transaction.wait()        /* check for the result of the transaction */

					//make order
					transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)   
					result = await transaction.wait()
				})
					
					it('Rejects invalid order ids', async () => {
					
					//rejects invalid order id (in this case the id is 99999)
					const invalidOrderId = 99999
					await expect(exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted
				    })

				    it('Rejects unautorized cancellation', async () => {

				    //rejects cancellation from other accounts different from the owner of the order
				    await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted
				    })
				
			})
		})
	})
})