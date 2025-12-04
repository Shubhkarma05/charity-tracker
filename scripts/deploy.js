
const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const CharityTracker = await ethers.getContractFactory("CharityTracker");

  // Deploy the contract
  console.log("Deploying the contract...");
  const charityTracker = await CharityTracker.deploy();

  // Wait for the deployment transaction to be mined
  await charityTracker.deployTransaction.wait();
  console.log("CharityTracker deployed to:", charityTracker.address);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
