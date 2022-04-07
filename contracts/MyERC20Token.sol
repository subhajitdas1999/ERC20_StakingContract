//SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MyERC20Token is ERC20,Ownable{
    constructor(string memory _name,string memory _symbol,uint _initialSupply) ERC20(_name,_symbol){
        uint _initialSupplyWithBits = tokenBitsAmount(_initialSupply);
        _mint(owner(),_initialSupplyWithBits);
    }

    function mint(uint _tokenSupply) public onlyOwner{
        uint _supplyWithBits = tokenBitsAmount(_tokenSupply);
        _mint(owner(),_supplyWithBits);
    }

    function burn(uint _tokenAmount) public onlyOwner{
        uint _tokenBits = tokenBitsAmount(_tokenAmount);
        _burn(owner(),_tokenBits);
    }

    function approveWithoutTokenBits(address _spender,uint _amount) public{
        uint _tokenBits = tokenBitsAmount(_amount);
        approve(_spender,_tokenBits);
    }

    //returns the with tokenBits
    function tokenBitsAmount(uint256 _amount) private view returns (uint256) {
        return _amount * (10**decimals());
    }
}