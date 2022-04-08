//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract ERC20StakingContract {

    //ERC20 contract
    IERC20 tokenContract;

    //staking details
    struct Staking{
        address stakingOwner;
        uint tokenBitsAmount;
        uint timeOfStaking;
    }

    //mapp all the stakings . address => [all the stakings]
    mapping(address => Staking[]) public stakings;
    //events for staking
    event staked(address indexed stakingOwner,uint tokenAmountBits,uint stakeIndex);
    //events for stake withdraw
    event withdraw(uint withdrawTokenBits,uint remainingTokenBits,uint stakeIndex);

    constructor(
        IERC20 _tokenContract
    ){
        tokenContract = _tokenContract;       
    }

    //stake contracts .approve this contract before staking.
    function stakeTokens(uint _tokenBitsAmount) public {
        require(tokenContract.balanceOf(msg.sender)>= _tokenBitsAmount,"Account have less token");
        require(tokenContract.allowance(msg.sender,address(this))>=_tokenBitsAmount,"Allowance is less for this contract");
        require(_tokenBitsAmount >= 100,"minimum staking TokenBits is 100");
        //construct the struct
        Staking memory staking = Staking(
            msg.sender,
            _tokenBitsAmount,
            block.timestamp
        );

        //transfer the tokens from staking owner to contract
       tokenContract.transferFrom(staking.stakingOwner,address(this),_tokenBitsAmount);

        //add the staking to the collections
        stakings[msg.sender].push(staking);

        //emit the staked events .latest stake Index should be length of stakes array -1 .
        emit staked(msg.sender,_tokenBitsAmount,stakings[msg.sender].length - 1);
    }

    //withdraw stake tokens 
    function withdrawStake(uint _stakeIndex, uint _tokenBitsAmount) public{
        //check the stake index
        require(_stakeIndex < stakings[msg.sender].length,"Invalid Index");
        //get the staking details from collection
        Staking storage staking = stakings[msg.sender][_stakeIndex];
        //check the balance
        require(staking.tokenBitsAmount >= _tokenBitsAmount,"Exceeding tokens amount");
        //update the tokenBits
        uint updatedTokenBits = staking.tokenBitsAmount - _tokenBitsAmount ;
        require(updatedTokenBits ==0|| updatedTokenBits >= 100,"withdraw all or remaining staking balance should be greater than 100");
        //calculate the ROI
        uint ROItokenBits  = calculateROI(_stakeIndex,_tokenBitsAmount);
        //total tokenBits to transfer the stakeOwner
        uint totalTokenBits = _tokenBitsAmount + ROItokenBits;
        //update the staking collection
        staking.tokenBitsAmount = updatedTokenBits;
        //transfer the tokens to the stake owner from this contract address
        tokenContract.transfer(staking.stakingOwner,totalTokenBits);

        //emit the withdraw events
        emit withdraw(_tokenBitsAmount,staking.tokenBitsAmount,_stakeIndex);

    }

    //get all the stakings of a user
    function getStakings(address _stakeOwner) public view returns(Staking[] memory){
        return stakings[_stakeOwner];
    }

    //calculate the ROI based on Investment
    function calculateROI(uint _stakeIndex,uint _tokenBitsAmount) public view returns(uint){
        Staking memory staking = stakings[msg.sender][_stakeIndex];
        uint stakingPeriod = block.timestamp-staking.timeOfStaking;
        uint returnPersentage;

        //for testing uncomment it
        // if (stakingPeriod >= 4 seconds){
        //     returnPersentage = 5;
        // }
        //if staking period is greater than 1 month(30days) and less than 6 month (~183 days) ROI is 5%        
        if (stakingPeriod >= 30 days && stakingPeriod < 183 days){
            returnPersentage = 5;
        }
        //if staking period is greater than 6 month(~183 days) and less than 1 year(365 days) ROI is 10%
        else if(stakingPeriod >= 183 days && stakingPeriod < 365 days){
            returnPersentage = 10;
        }
        //if staking period is greater than 1 year, ROI is 15%
        else if(stakingPeriod >= 365 days) {
            returnPersentage = 15;
        }

        //erc20 decimal is present,considering it into the calculation 
        return (_tokenBitsAmount * returnPersentage)/100 ; 
    }

}
