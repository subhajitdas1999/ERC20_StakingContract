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

  const initialTokenSupply = 1000000;

  const stakeSomeTokensFromOwnersAccount = async (
    tokenMintAmount,
    tokenStakeAmount
  ) => {
    //mint 1000 token to owner account
    await token.mint(tokenMintAmount);
    //approving staking contract as a operator for 1000 tokens
    await token.approveWithoutTokenBits(staking.address, tokenMintAmount);

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
    await token.mint(1000);

    //now try to stake 1200 tokens
    await expect(staking.stakeTokens(1200)).to.be.revertedWith(
      "Account have less token"
    );
  });

  it("cannot stake less than 100 tokens", async () => {
    //mint 1000 token to owner account
    await token.mint(1000);

    //now try to stake 50 tokens
    await expect(staking.stakeTokens(50)).to.be.revertedWith(
      "minimum staking balance is 100 tokens"
    );
  });

  it("user should able to stake tokens", async () => {
    const stakingAmount = 500;

    //mint 1000 token to owner account
    await token.mint(1000);
    //approving staking contract as a operator for 1000 tokens
    await token.approveWithoutTokenBits(staking.address, 1000);

    //staking contract balance before any user stake tokens
    const stakingContractBalanceBefore = await token.balanceOf(staking.address);
    //user balance before staking
    const userBalanceBefore = await token.balanceOf(owner.address);

    //now stake 500 tokens
    //should emit the staked events
    await expect(staking.stakeTokens(stakingAmount)).to.emit(staking, "staked");

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

  it("Cannot withdraw stake with invalid staking id", async () => {
    //mint and stake some tokens
    const [tokenMintAmount, tokenStakeAmount] = [1000, 500];
    await stakeSomeTokensFromOwnersAccount(tokenMintAmount, tokenStakeAmount);

    //now try to withdraw with staking id 0 (invalid Id)
    await expect(staking.withdrawStake(0, tokenStakeAmount)).to.be.revertedWith(
      "staking Id is not exists"
    );
  });

  it("only staking owner is allowed withdraw his staking", async () => {
    //mint and stake some tokens
    const [tokenMintAmount, tokenStakeAmount] = [1000, 500];
    await stakeSomeTokensFromOwnersAccount(tokenMintAmount, tokenStakeAmount);

    //as this is the first staking , so the stakedId will be 1 and staking owner is owner account
    //now try to withdraw this stake with add1 account
    await expect(
      staking.connect(addr1).withdrawStake(1, tokenStakeAmount)
    ).to.be.revertedWith("Only staking owner is allowed to withdraw");
  });

  it("User cannot withdraw more tokens than he staked", async () => {
    //mint and stake some tokens
    const [tokenMintAmount, tokenStakeAmount] = [1000, 500];
    await stakeSomeTokensFromOwnersAccount(tokenMintAmount, tokenStakeAmount);

    //trying to withdraw 200 extra tokens than staked
    await expect(
      staking.withdrawStake(1, tokenStakeAmount + 200)
    ).to.be.revertedWith("Exceeding tokens amount");
  });

  it("user should get his 5% staking reward for the time period of 4 seconds", async () => {
    //mint and stake some tokens
    const [tokenMintAmount, tokenStakeAmount] = [1000, 500];
    await stakeSomeTokensFromOwnersAccount(tokenMintAmount, tokenStakeAmount);

    //get the staking details
    const [stakeId, stakingOwner, tokenBitsAmount, timeOfStaking] =
      await staking.stakings(1);

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
    const userStakingRewardAmount = BigNumber.from(tokenBitsAmount)
      .mul(BigNumber.from(5))
      .div(BigNumber.from(100));

    //now withdraw the staking amount with staking Id = 1
    await staking.withdrawStake(stakeId, tokenStakeAmount);

    //user balance after stake withdrawal
    const userBalanceAfterWithdrawal = await token.balanceOf(owner.address);

    const UserTotalBalanceWithoutReward = BigNumber.from(userBalanceBeforeWithdrawal).add(tokenBitsAmount);
    //difference between user balance after staking and the amount his account have . that's how we'll get the ROI(4%)
    const diff = BigNumber.from(userBalanceAfterWithdrawal).sub(
      BigNumber.from(UserTotalBalanceWithoutReward)
    );

    

    //this diff should be same as user reward for staking 4 seconds
    expect(diff).to.equal(userStakingRewardAmount);
  });
});
