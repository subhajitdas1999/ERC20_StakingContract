const { BigNumber } = require("ethers");

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const Staking = await ethers.getContractFactory("ERC20StakingContract");
    const Token = await ethers.getContractFactory("MyERC20Token");
    const initialTokenSupply = BigNumber.from("1000000000000000000000000");
    const token = await Token.deploy("MyToken", "MT", initialTokenSupply);
    const staking = await Staking.deploy(token.address);

    //send all the tokens to the staking contract. so that the staking contract have have balance on its own
    const deployerTokenBalance = await token.balanceOf(deployer.address);
    await token.transfer(staking.address, deployerTokenBalance);
  
    console.log("Staking address:", staking.address);
    console.log("ERC20Token address:", token.address);

  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });