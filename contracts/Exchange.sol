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

		mapping(uint256 => bool) public orderFilled;										/* this mapping tracks the filled orders */

	uint256 public orderCount; /* now counter is 0 and everytime an order is made the count goes +1 */

		event Deposit(address token, address user, uint256 amount, uint256 balance);
		event Withdraw(address token, address user, uint256 amount, uint256 balance);
		event Order(uint256 id,address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
		event Cancel(uint256 id,address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
		event Trade(uint256 id,address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address creator, uint256 timestamp);   /* here the 'user' is who accept the order and the 'creator' is who made/create the order */

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

		orderCount ++;

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



	//execute orders
	function fillOrder(uint256 _id) public {

		//order ID must exist
		require(_id > 0 && _id <= orderCount, "Order does not exist");

		//order can't be filled
		require(!orderFilled[_id]);    /* don't trade on a ongoing trading order */

		//order can't be cancelled
		require(!orderCancelled[_id]); /* don't trade on a cancelled order */

		//fetch order
		_Order storage _order = orders[_id];

		//swap tokens (trade)
		_trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);       /* here we use the function '_trade' to make actually the trades in a internal function */

		//order executed
		orderFilled[_order.id] = true;
	}


	function _trade(
		uint256 _orderId,
		address _user,
		address _tokenGet,
		uint256 _amountGet,
		address _tokenGive,
		uint256 _amountGive
	) internal {

		//fees are paid by user who accepted the order and deducted from the whole amount of tokens who choose to give for the trade
		uint256 _feeAmount = (_amountGet * feePercent) / 100;

		//trading process
		tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - (_amountGet + _feeAmount);          /* first part of the trading process: tokens requested to fill the order are subtracted from the total token availability of the account who accepted the trade(in fact is msg sender because accepted the request to trade) */
		tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;					 /* second part of trading process: user who created the order gets the token requested */
		
		
		tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount;			 /* third part: charging fees */

		tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;				 /* fourth part of trading process: user who created the order give its tokens for change */
		tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + _amountGive;		 /* fifth part of trading process: user who accepted the trade gets the tokens for change */

		//emit trade event
		emit Trade(_orderId, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, _user, block.timestamp);
	}

}