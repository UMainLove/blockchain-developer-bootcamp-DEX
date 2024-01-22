// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
	string public name = "My Token"; /*state variable (it's a var that belongs to the blockchain. the blockchain take the var from the contract' state); public means that this var is readable by everyone once the smart contract is deployed on chain */
}
