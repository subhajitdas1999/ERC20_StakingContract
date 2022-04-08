const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("ERC20StakingContract Contract", () => {
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let Token;
  let Staking;
  let token;
  let staking;

  //initial supplied 1000000 tokens
  const initialTokenSupply = BigNumber.from("1000000000000000000000000");
  //owner mint 1000 tokens
  const ownerMintTokenAmount = BigNumber.from("1000000000000000000000");

  //owner stake amount 500 tokens
  const ownerStakeTokenAmount = BigNumber.from("1000000000000000000000").div(
    BigNumber.from(2)
  );
  const mintApproveStakeTokensFromOwnersAccount = async (
    tokenMintAmount,
    tokenStakeAmount
  ) => {
    //mint 1000 token to owner account
    await token.mint(tokenMintAmount);
    //approving staking contract as a operator for 1000 tokens
    await token.approve(staking.address, tokenMintAmount);

    //stake 500 tokens
    await staking.stakeTokens(tokenStakeAmount);
  };

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    Staking = await ethers.getContractFactory("ERC20StakingContract");
    Token = await ethers.getContractFactory("MyERC20Token");

    token = await Token.deploy("MyToken", "MT", initialTokenSupply);
    staking = await Staking.deploy(token.address);

    //send all the tokens to the staking contract. so that the staking contract have have balance on its own
    const deployerTokenBalance = await token.balanceOf(owner.address);
    await token.transfer(staking.address, deployerTokenBalance);
  });

  it("staking contract should have all the tokens, that are initially supplied", async () => {
    const stakingContractBalance = await token.balanceOf(staking.address);
    const totalSupply = await token.totalSupply();
    expect(stakingContractBalance).to.equal(totalSupply);
  });

  it("user cannot stake more token than his account balance", async () => {
    //mint 1000 token to owner account
    await token.mint(ownerMintTokenAmount);

    //now try to stake 100 tokens more
    await expect(
      staking.stakeTokens(ownerMintTokenAmount + 100)
    ).to.be.revertedWith("Account have less token");
  });

  it("user have to approve the contract before staking contract", async () => {
    //mint 1000 token to owner account
    await token.mint(ownerMintTokenAmount);

    //now try to stake 1000 tokens more
    await expect(staking.stakeTokens(ownerMintTokenAmount)).to.be.revertedWith(
      "Allowance is less for this contract"
    );
  });

  it("cannot stake less than 100 tokensBits", async () => {
    //mint 1000 token to owner account
    await token.mint(ownerMintTokenAmount);

    //approve the contract
    await token.approve(staking.address, ownerMintTokenAmount);

    //now try to stake 50 tokens
    await expect(staking.stakeTokens(50)).to.be.revertedWith(
      "minimum staking TokenBits is 100"
    );
  });

  it("user should able to stake tokens", async () => {
    //staking contract balance before anyone stakes
    const stakingContractBalanceBefore = await token.balanceOf(staking.address);

    //user balance before staking is same token mint amount
    const userBalanceBefore = ownerMintTokenAmount;

    //mint tokens approve it for the contract and stake the half amount
    await mintApproveStakeTokensFromOwnersAccount(
      ownerMintTokenAmount,
      ownerStakeTokenAmount
    );

    //staking contract balance after anyone stakes
    const stakingContractBalanceAfter = await token.balanceOf(staking.address);
    //user balance after staking
    const userBalanceAfter = await token.balanceOf(owner.address);

    //difference in staking contract balance
    const stakingContractBalanceDiff = BigNumber.from(
      stakingContractBalanceAfter
    ).sub(BigNumber.from(stakingContractBalanceBefore));
    //diff in user balance
    const userBalanceDiff = BigNumber.from(userBalanceBefore).sub(
      BigNumber.from(userBalanceAfter)
    );

    //this two difference should be same
    expect(stakingContractBalanceDiff).to.equal(userBalanceDiff);
  });

  it("Cannot withdraw stake with invalid staking index", async () => {
    //mint tokens approve it for the contract and stake the half amount
    await mintApproveStakeTokensFromOwnersAccount(
      ownerMintTokenAmount,
      ownerStakeTokenAmount
    );

    //now try to withdraw with staking index 1 (as user only staked 1 time so index 1 is invalid (index starts from 0))
    await expect(staking.withdrawStake(1, ownerStakeTokenAmount)).to.be.revertedWith(
      "Invalid Index"
    );
  });


  it("User cannot withdraw more tokens than he staked", async () => {
    //mint tokens approve it for the contract and stake the half amount
    await mintApproveStakeTokensFromOwnersAccount(
      ownerMintTokenAmount,
      ownerStakeTokenAmount
    );

    //trying to withdraw 200 extra tokens than staked . index is 0 for the first staking.
    await expect(
      staking.withdrawStake(0, ownerStakeTokenAmount + 200)
    ).to.be.revertedWith("Exceeding tokens amount");
  });

  it("user should get his 5% staking reward for the time period of 4 seconds", async () => {
   //mint tokens approve it for the contract and stake the half amount
   await mintApproveStakeTokensFromOwnersAccount(
    ownerMintTokenAmount,
    ownerStakeTokenAmount
  );


    //wait for 5 seconds , so that we can the 5 % stake . for this test , change the contract code from 4 weeks to 4 seconds
    //function to add delay
    const delay = (t) => {
      return new Promise((resolve) => {
        setTimeout(resolve, t);
      });
    };

    //add delay of 5 seconds
    console.log("added delay of 5 seconds");
    await delay(5000);

    //user balance before stake withdrawal
    const userBalanceBeforeWithdrawal = await token.balanceOf(owner.address);

    //user should get 5% of tokenBitsAmount as a reward after 4 seconds of staking
    const userStakingRewardAmount = BigNumber.from(ownerStakeTokenAmount)
      .mul(BigNumber.from(5))
      .div(BigNumber.from(100));
  
    //now withdraw the staking amount with staking index = 0, as this the first staking from owner address
    await staking.withdrawStake(0, ownerStakeTokenAmount);

    //user balance after stake withdrawal
    const userBalanceAfterWithdrawal = await token.balanceOf(owner.address);

    const UserTotalBalanceWithoutReward = BigNumber.from(userBalanceBeforeWithdrawal).add(ownerStakeTokenAmount);

    //difference between user balance after staking and the amount his account have . that's how we'll get the ROI(4%)
    const diff = BigNumber.from(userBalanceAfterWithdrawal).sub(
      BigNumber.from(UserTotalBalanceWithoutReward)
    );

    //this diff should be same as user reward for staking 4 seconds
    expect(diff).to.equal(userStakingRewardAmount);
  });
});
