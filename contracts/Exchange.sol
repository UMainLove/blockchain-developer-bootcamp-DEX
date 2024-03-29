// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";             /* we import also the Token.sol to use it for these contract's functions and to use that functions for this contract */


contract Exchange {
	
	address public feeAccount;
	uint256 public feePercent;

		mapping(address => mapping(address => uint256))	public tokens;						/* this nested mapping tracks all users and their deposits, the first address is the user address, the second is the token address and then its value */
		
		event Deposit(address token, address user, uint256 amount, uint256 balance);
		event Withdraw(address token, address user, uint256 amount, uint256 balance);
	constructor(
		address _feeAccount,
		uint256 _feePercent
		) {
		feeAccount = _feeAccount;   /* this is the address where the fees got paid */
		feePercent = _feePercent;   /* this is the percentage of the fee that the Exchange takes */
	}

	//deposit tokens
	function depositToken(address _token, uint256 _amount) public {
		//transfer tokens to exchange
		require(Token(_token).transferFrom(msg.sender, address(this), _amount));              /* we call 'Token' that is the name of the smart contract imported before in the import list, then we assign it to the '_token' address to use it in this smart contract. we chose to use the 'transferFrom(from,to,value)' function from the Token.sol smart contract to transfer tokens from a wallet to the exchange smart contract. 'address(this)' means the address of this smart contract */

		//update user balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

		//emit an event
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	function withdrawToken(address _token, uint256 _amount) public {
		//ensure user have enough tokens to withdraw
		require(tokens[_token][msg.sender] >= _amount);

		//transfer tokens to user
		require(Token(_token).transfer(msg.sender, _amount));

		//update user balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
		
		//emit an event
		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	//check balance
	function balanceOf(address _token, address _user)     /* this is an alternative to show what a mapping result could be returned */
		public 
		view
		returns(uint256)
		{
			return tokens[_token][_user];
		}

}