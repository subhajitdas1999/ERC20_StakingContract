# ERC20_StakingContract

where user stakes his ERC20 tokens . 
after 4 weeks of deposit user gets 5% APR , after 6 months gets 10% APR and after 1 year gets 15% APR


# the contracts is deployed at rinkeby network 

1. staking contract 0xB93c4623587Dd807C3Ea52A44f849849eA9d0869 .
contract is verified . [etherscan link](https://rinkeby.etherscan.io/address/0xB93c4623587Dd807C3Ea52A44f849849eA9d0869#code)

2. ERC20Token contract 0x64b6a4BF29d7242D552B1D2FD113B68421136E89 .
contract is verified . [etherscan link](https://rinkeby.etherscan.io/address/0x64b6a4BF29d7242D552B1D2FD113B68421136E89#code)


# To Deploy the contracts 

for rinkeby network 

1. configure hardhat.config.js

2. run :- npx hardhat run scripts/deploy.js --network rinkeby

# To run the tests for staking contract

when running tests, change the time period in staking contract's calculateROI function from weeks to seconds (for testing).
otherwise last test will fail.

1. run:- npx hardhat test (from root directory)
