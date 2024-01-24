const { ethers } = require('hardhat'); /* here we're taking the hardhat library inside this file and using the ethers functions. ethers in fact it's not a var because it's destructured by the {...} */
const { expect } = require('chai'); /* we do the same as the hardhat with the chai library */

const tokens = (n) => {                                        /* >>>>>>>this is a variable called "tokens" that calls a function (defined in "n") that has another function inside. */
	return ethers.utils.parseUnits(n.toString(), 'ether')      /* this function use the ethers library and picks up the parseUnit (used to convert a number into a mesure unit of ethereum, in this case is ether) and the variable argument is picked up by the function toString */
}

describe('Token', () => { /* here we're describing the functions that have to be tested assuming this file is an automated user interaction with the smart contract. The name in "..." is the name of the smart contract*/
	

	/*        tests go inside here...       */


let token    /* this allow us to use this variable in every test function */

	beforeEach(async () => {
	
	//fetch the token from the blockchain so we can avoid it from duplicate code in each functions below

		const Token = await ethers.getContractFactory('Token')                                          /* first we call the smart contract */
		token = await Token.deploy('Dapp University', 'DAPP', '1000000')                                /* then we wait to be deployed */

	})


describe('Deployment', () => {                  //here we define first the main variable that has to be called in the tests

	const name = 'Dapp University'
	const symbol = 'DAPP'
	const decimals = '18'
	const totalSupply = tokens('1000000')


	it('has correct name', async () => {                /* >>>>>> here there's the function that shows the name of the token */

	//step 1. fetch the token from the blockchain (we did it in the before each function)
		
	//step 2. read the token name
		//const name = await token.name()

	//step 3. check the name that is correct
		//expect(name).to.equal('Dapp University')

		//now we put step2 and step3 in the same function (the previous steps' line are commented)
		expect(await token.name()).to.equal(name)
	})


	it('has correct symbol', async () => {               /* >>>>>> here there's the function that shows the symbol of the token */

	//step 1. fetch the token from the blockchain (we did it in the before each function)
		
	//step 2. read the token symbol
		//const symbol = await token.symbol()          

	//step 3. check the symbol that is correct
		//expect(symbol).to.equal('DAPP')

		//now we put step2 and step3 in the same function (the previous steps' line are commented)
		expect(await token.symbol()).to.equal(symbol)
	})


	it('has correct decimals', async () => {           /* >>>>>> here there's the function that shows the decimals of the token */

		expect(await token.decimals()).to.equal(decimals)
	})


	it('has correct total supply', async () => {           /* >>>>>> here there's the function that shows the decimals of the token */

		//const value = ethers.utils.parseUnits('1000000', 'ether')  /* here we use a function from utility's ether library that convert a number in the unit mesure we want */
		//expect(await token.totalSupply()).to.equal(value)          /* so in the chai test we're gonna use the 'value' variable which contains the right number */

				/* we can make the code in this function shorter than this 2 lines above by adding a variable that calls a function outsde the main (at the top of the file) */


		expect(await token.totalSupply()).to.equal(totalSupply)  /* according to the description of the function "tokens" outside the main, here we just need to call the var (that becomes a function and pass the value that is the argument which is "n") and the number we want to use */
	})
})

})