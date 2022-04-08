//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ERC20StakingContract {

    //count all the staking
    uint private stakeId;

    //ERC20 contract
    IERC20 tokenContract;

    //token contract decimal
    uint private decimals=18;

    //staking details
    struct Staking{
        uint stakeId;
        address stakingOwner;
        uint tokenBitsAmount;
        uint timeOfStaking;
    }

    //mapp all the stakings. stakeId => Staking.
    mapping(uint => Staking) public stakings;

    //events for staking
    event staked(address indexed stakingOwner,uint tokenAmount,uint stakeId);
    //events for stake withdraw
    event withdraw(uint withdrawTokenBits,uint remainingTokenBits,uint stakeId);

    constructor(
        IERC20 _tokenContract
    ){
        tokenContract = _tokenContract;
        
    }

    //stake contracts
    function stakeTokens(uint _tokenAmount) public {
        uint tokenBits = tokenBitsAmount(_tokenAmount);

        require(tokenContract.balanceOf(msg.sender)>= tokenBits,"Account have less token");
        require(_tokenAmount >=100,"minimum staking balance is 100 tokens");

        //increase the stake id
        stakeId++;

        Staking memory staking = Staking(
            stakeId,
            msg.sender,
            tokenBits,
            block.timestamp
        );
        //transfer the tokens from staking owner to contract
       tokenContract.transferFrom(staking.stakingOwner,address(this),tokenBits);

        //add the staking to the collections
        stakings[stakeId] = staking;

        //emit the staked events
        emit staked(staking.stakingOwner,_tokenAmount,stakeId);
    }

    //withdraw stake tokens
    function withdrawStake(uint _stakeId,uint _tokenAmount) public{
        require(_stakeId > 0 && _stakeId<=stakeId,"staking Id is not exists");
        uint tokenBits = tokenBitsAmount(_tokenAmount);
        Staking storage staking = stakings[_stakeId];
        require(staking.stakingOwner == msg.sender,"Only staking owner is allowed to withdraw");
        require(staking.tokenBitsAmount >= tokenBits,"Exceeding tokens amount");

        uint updatedTokenBits = staking.tokenBitsAmount - tokenBits ;
       //calculate the ROI
        uint ROItokenBits  = calculateROI(_stakeId,tokenBits);
        //total tokenBits to transfer the stakeOwner
        uint totalTokenBits = tokenBits + ROItokenBits;
        //update the staking collection
        staking.tokenBitsAmount = updatedTokenBits;
        //transfer the tokens to the stake owner from this contract address
        tokenContract.transfer(staking.stakingOwner,totalTokenBits);

        //emit the withdraw events
        emit withdraw(tokenBits,staking.tokenBitsAmount,staking.stakeId);

    }

    function calculateROI(uint _stakeId,uint _tokenBits) private view returns(uint){
        Staking memory staking = stakings[_stakeId];
        uint stakingPeriod = block.timestamp-staking.timeOfStaking;
        uint returnPersentage;
        //if staking period is greater than 1 month and less than 6 month ROI is 5%
        if (stakingPeriod >= 4 weeks && stakingPeriod < 24 weeks){
            returnPersentage = 5;
        }
        //if staking period is greater than 6 month and less than 1 year ROI is 10%
        else if(stakingPeriod >= 24 weeks && stakingPeriod < 48 weeks){
            returnPersentage = 10;
        }
        //if staking period is greater than 1 year, ROI is 15%
        else if(stakingPeriod >= 48 weeks) {
            returnPersentage = 15;
        }

        //erc20 decimal is present,considering it into the calculation 
        return (_tokenBits * returnPersentage)/100 ; 

    }

    

    //returns the with tokenBits
    function tokenBitsAmount(uint256 _amount) private view returns (uint256) {
        return _amount * (10**decimals);
    }




}
