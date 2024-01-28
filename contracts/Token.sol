// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
	string public name; /*state variable (it's a var that belongs to the blockchain. the blockchain take the var from the contract' state); public means that this var is readable by everyone once the smart contract is deployed on chain */
	string public symbol;
	uint256 public decimals = 18;
	uint256 public totalSupply; //1MLN * [(10^18)>that is represented by the decimals]


	//Track Balances of accounts that own the token
	mapping(address => uint256) public balanceOf; /* mapping is a database function where (in this case) for each address correspond a number(the balance). This object becomes a function variable that contain the database itself(balanceOf). Any values is stored in the blockchain */


	
	//Send token among accounts


	constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {       /* constructor is a function called only one time since the contract is deployed on the blockchain. In this case it's used to create more tokens that have some standard charateristics (that are the argument of the constructor). We use "memory" because these are local variables so are available only inside this smart contract */
		name = _name;                                                                     /* here we defined the variables that are going to be chosen at the deployment time to allow us create multiple tokens with different name, symbol and total supply. We can see in "Token.js" that in the function beforeEach we assign the actual variable in deployment time. This is a real assignment made when the smart contract goes on chain */
		symbol = _symbol;
		totalSupply = _totalSupply * (10**decimals);
		balanceOf[msg.sender] = totalSupply; //this line allows us to write data inside the mapping
	}
}
