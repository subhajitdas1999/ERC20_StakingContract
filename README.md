# ERC20_StakingContract

where user stakes his ERC20 tokens . 
after 4 weeks of deposit user gets 5% APR , after 6 months gets 10% APR and after 1 year gets 15% APR.

For staking before calling the function "stakeTokens" , you need to approve staking or greater amount for the contract address,
so that it can transfer the token amount from your account to it's own account.Otherwise it'll revert the transaction.

for stake withdrawal use the function "withdrawStake" with a given stake index and tokenBits Amount.


# the contracts is deployed at rinkeby network 

1. staking contract 0x3bAE1256663b43e503aee0F01e0Be2F0d93db73F .
contract is verified . [etherscan link](https://rinkeby.etherscan.io/address/0x3bAE1256663b43e503aee0F01e0Be2F0d93db73F#code)

2. ERC20Token contract 0x65FB172158b7C09946Be0CF99177108cc2983b67 .
contract is verified . [etherscan link](https://rinkeby.etherscan.io/address/0x65FB172158b7C09946Be0CF99177108cc2983b67#code)


# To Deploy the contracts 

for rinkeby network 

1. configure hardhat.config.js

2. run :- npx hardhat run scripts/deploy.js --network rinkeby

# To run the tests for staking contract



1. run:- npx hardhat test (from root directory)
