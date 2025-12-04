
const { expect } = require("chai");

describe("CharityTracker Refund System", function () {
  let CharityTracker;
  let charityTracker;
  let owner;
  let donor1;
  let donor2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers
    CharityTracker = await ethers.getContractFactory("CharityTracker");
    [owner, donor1, donor2, ...addrs] = await ethers.getSigners();
    
    // Deploy a new CharityTracker contract before each test
    charityTracker = await CharityTracker.deploy();
    await charityTracker.deployed();
  });

  describe("Refund Functionality", function () {
    const campaignId = "TEST001";
    const title = "Test Campaign";
    const description = "Test Description";
    const goalAmount = ethers.parseEther("10"); // 10 ETH goal
    
    it("Should allow donors to get refunds for failed campaigns", async function () {
      // Get the current timestamp
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = currentTime + 3600; // Campaign ends in 1 hour

      // 1. Create a campaign
      await charityTracker.createCampaign(
        campaignId,
        title,
        description,
        goalAmount,
        endTime
      );

      // 2. Make donations
      const donation1Amount = ethers.parseEther("2");
      const donation2Amount = ethers.parseEther("3");

      await charityTracker.connect(donor1).recordDonation(
        campaignId,
        donation1Amount,
        "Testing donation 1",
        { value: donation1Amount }
      );

      await charityTracker.connect(donor2).recordDonation(
        campaignId,
        donation2Amount,
        "Testing donation 2",
        { value: donation2Amount }
      );

      // 3. Fast forward time past the end time
      await network.provider.send("evm_increaseTime", [3601]);
      await network.provider.send("evm_mine");

      // 4. Initiate refunds
      await charityTracker.refundDonors(campaignId);

      // 5. Get initial balances before refund
      const donor1BalanceBefore = await ethers.provider.getBalance(donor1.address);
      
      // 6. Claim refund for donor1
      await charityTracker.connect(donor1).claimRefund();

      // 7. Check if donor1 received the refund
      const donor1BalanceAfter = await ethers.provider.getBalance(donor1.address);
      expect(donor1BalanceAfter - donor1BalanceBefore).to.be.closeTo(
        donation1Amount,
        ethers.parseEther("0.01") // Allow for gas costs
      );

      // 8. Try to claim refund again (should fail)
      await expect(
        charityTracker.connect(donor1).claimRefund()
      ).to.be.revertedWith("No refunds available");
    });

    it("Should not allow refunds for successful campaigns", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = currentTime + 3600;

      // 1. Create campaign
      await charityTracker.createCampaign(
        campaignId,
        title,
        description,
        goalAmount,
        endTime
      );

      // 2. Make donation that meets the goal
      await charityTracker.connect(donor1).recordDonation(
        campaignId,
        goalAmount,
        "Full amount donation",
        { value: goalAmount }
      );

      // 3. Fast forward time
      await network.provider.send("evm_increaseTime", [3601]);
      await network.provider.send("evm_mine");

      // 4. Try to initiate refunds (should fail)
      await expect(
        charityTracker.refundDonors(campaignId)
      ).to.be.revertedWith("Goal was met, no refunds");
    });
  });
});