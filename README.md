# ERC20_StakingContract

where user stakes his ERC20 tokens . 
after 4 weeks of deposit user gets 5% APR , after 6 months gets 10% APR and after 1 year gets 15% APR


# the contracts is deployed at rinkeby network 

1. staking contract 0xe8057db1b81c9247E21CD29754f6592c0B1C6235 .contract is verified [etherscan](https://rinkeby.etherscan.io/address/0xe8057db1b81c9247E21CD29754f6592c0B1C6235#code)

2. ERC20TOken contract 0x1aB0aC78503037D16780c266EAa0C7CD89D06BB3


# To Deploy the contracts 

for rinkeby network 

1. configure hardhat.config.js

2. run :- npx hardhat run scripts/deploy.js --network rinkeby

# To run the tests for staking contract

1. run:- npx hardhat test (from root directory)
