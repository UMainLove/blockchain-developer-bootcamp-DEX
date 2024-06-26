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
	mapping(address => mapping(address => uint256)) public allowance; /* this is a nested mapping where the deployer address calls the exchange address to give the permission to spend money in its behalf */

	event Transfer(                    /* this is a function that allow us to visualize the data we write in as a log of the blockchain. The data 'indexed' means that is easier to find in the emission of the event. An event is emitted in the choosen functions of the smart contract */
		address indexed from,
		address indexed to,
		uint256 value
	);

	event Approval(                   /* this event and the approve function comes from the EIP-20 from the official ethereum source */
		address indexed owner,
		address indexed spender,
		uint256 value
	);

	constructor(                       /* constructor is a function called only one time since the contract is deployed on the blockchain. In this case it's used to create more tokens that have some standard charateristics (that are the argument of the constructor). We use "memory" because these are local variables so are available only inside this smart contract */
		string memory _name, 
		string memory _symbol,
		uint256 _totalSupply
	) {       
		name = _name;                                                                     /* here we defined the variables that are going to be chosen at the deployment time to allow us create multiple tokens with different name, symbol and total supply. We can see in "Token.js" that in the function beforeEach we assign the actual variable in deployment time. This is a real assignment made when the smart contract goes on chain */
		symbol = _symbol;
		totalSupply = _totalSupply * (10**decimals);
		balanceOf[msg.sender] = totalSupply; //this line allows us to write data inside the mapping
	  }



	//Send token among accounts
	function transfer(address _to, uint256 _value)
	 	public 
	returns (bool success) 
	{

		//require that sender has enough tokens to spend
		require(balanceOf[msg.sender] >= _value); /* this solidity function allows to execute or not the code below it only if the argument expression is satisfied. In this case to tranfer an amount of tokens from an account to another we have to check first if the sender has a balance >= than tha value we choose to send through this function (_value) */
//	    require(_to != address(0)); /* the sender is required to be different from the first account */

		//deduct tokens from spender
//		balanceOf[msg.sender] = balanceOf[msg.sender] - _value; /* here we have the new balance of the sender that is the result between the previous balance and the value we want to transfer */

		//credit tokens to receiver
//		balanceOf[_to] = balanceOf[_to] + _value; /* here we have the new balance of the receiver that is the result between the sum of the old balance and the value we want to transfer */
	
		//emitting the event
//		emit Transfer(msg.sender, _to, _value);  /* to emit an event we just explictly call the function with the arguments that has to be replaced with the vars defined in the function we want to emit the event (in thsi case the '_from' is the "msg.sender", the '_to' is the "_to" and the '_value' is the "_value") */

		_transfer(msg.sender, _to, _value); /* as soon as we have the _transfer function, we can avoid the duplication of code in this transfer function just using this line */ 

	return true;
	}


//this function links the transfer function and the transferFrom function (what's inside this function is the same of the transfer function except for the argument of the balanceOf that is the account from where the tokens has to be deducted and sent to the delegated spender)
function _transfer(address _from,
 address _to,
 uint256 _value
 ) internal {

 	require(_to != address(0));
	balanceOf[_from] = balanceOf[_from] - _value;
	balanceOf[_to] = balanceOf[_to] + _value;
	emit Transfer(_from, _to, _value);
}


	//Approve token spending for the spender
	function approve(address _spender, uint256 _value)
		public
	returns (bool success)
	{
		require(_spender != address(0));                /* the approver is required to be different from the first account */
		allowance[msg.sender][_spender] = _value;       /* this is the correct way to access to the nested mapping defined before (using 2 values in 2 different '[...]') */
		emit Approval(msg.sender, _spender, _value);    /* now we're going to call the event for this function with the local var of the function */
	
	return true;
	}







//Spend token on someone behalf
	function transferFrom(address _from, address _to, uint256 _value)
		public
 	returns (bool success)
 	{
 	//check approval for delegated spending
 	require(_value <= balanceOf[_from]); /* the balance of the main address has to be paired with the value of the tokens approved to spend in its behalf */
 	require(_value <= allowance[_from][msg.sender]); /* now the allowance is retriving permissions from the nested mapping logic (the '[_from]' is the delegated spender and comes from the 'transferFrom' function and the '[msg.sender]' is who allow to the delegated spender the tokens' spending in its behalf) */
 	

 	//reset allowance (avoid double spending from the delegated account who already spent other tokens)
 	allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;        /* so once the allowance is subtracted one time from the spender, the delegated spender has to be resetted */


 	//spend tokens
 	_transfer(_from, _to, _value);

 	return true;
 	}
}