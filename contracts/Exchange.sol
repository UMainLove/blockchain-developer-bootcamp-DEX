// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";             /* we import also the Token.sol to use it for these contract's functions and to use that functions for this contract */


contract Exchange {
	
	address public feeAccount;
	uint256 public feePercent;

		mapping(address => mapping(address => uint256))	public tokens;						/* this nested mapping tracks all users and their deposits, the first address is the user address, the second is the token address and then its value */
		
		mapping(uint256 => _Order) public orders;											/* this is the "order mapping" that is linked to the struct in fact the 'uint256' is the 'id' from the '_Order' */

		mapping(uint256 => bool) public orderCancelled;										/* this mapping tracks the cancelled orders */

	uint256 public orderCount; /* now counter is 0 and everytime an order is made the count goes +1 */

		event Deposit(address token, address user, uint256 amount, uint256 balance);
		event Withdraw(address token, address user, uint256 amount, uint256 balance);
		event Order(uint256 id,address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
		event Cancel(uint256 id,address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);

		//this struct is used in oreder mapping and, as events, they must be called properly in the needed functions 
	struct _Order {
		//attributes of an order (in this case are the same of the 'function makeOrder')
		uint256 id;               /* unique identifier for orders */
		address user;             /* user who make the order */

		address tokenGet;
		uint256 amountGet;
		address tokenGive;
		uint256 amountGive;
		
		uint256 timestamp;       /* when the order was created */
	}
	

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



	//make orders
	function makeOrder(
		address _tokenGet,
		uint256 _amountGet,
		address _tokenGive,
		uint256 _amountGive
	) public {
		//token give (the token they want to spend) - which token and how much
		//token get (the token they want to receive) - which token and how much
		
		//require token balance
		require(balanceOf(_tokenGive, msg.sender) >= _amountGive); /* this line prevents orders where tokens aren't on the exchange */

		orderCount = orderCount + 1;

		orders[orderCount] = _Order(
			orderCount, // id
			msg.sender, // user
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp // timestamp
		);

		//emit event
		emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
	}






	//cancel orders
	function cancelOrder(uint256 _id) public {

		//fetch order (read the orders from mapping)
		_Order storage _order = orders[_id];                       /* through '_Order storage' we could read the var '_order' (which contains the id from the mapping) in the blockchain memory */

		//ensure the order that is going to be cancelled belongs to its owner and no one else
		require(address(_order.user) == msg.sender);

		//order must exist
		require(_order.id == _id);

		//delete order
		orderCancelled[_id] = true;								   /* it assign a 'true' for the order cancelled in mapping */


		//emit event of cancellation
		emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, block.timestamp);
	}

}