const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CharityTracker", function () {
  let CharityTracker;
  let charityTracker;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    CharityTracker = await ethers.getContractFactory("CharityTracker");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy a new CharityTracker contract before each test
    charityTracker = await CharityTracker.deploy();
    await charityTracker.deployed();
  });

  describe("Donations", function () {
    it("Should record a donation correctly", async function () {
      const campaignId = "Campaign1";
      const amount = ethers.utils.parseEther("1"); // 1 ETH
      const purpose = "Education";

      // Record a donation
      await charityTracker.connect(addr1).recordDonation(campaignId, amount, purpose);

      // Get all donations
      const donations = await charityTracker.getDonations();
      
      // Check donation details
      expect(donations.length).to.equal(1);
      expect(donations[0].donor).to.equal(addr1.address);
      expect(donations[0].campaignId).to.equal(campaignId);
      expect(donations[0].amount).to.equal(amount);
      expect(donations[0].purpose).to.equal(purpose);
    });

    it("Should get donations by donor", async function () {
      // Record multiple donations from different addresses
      await charityTracker.connect(addr1).recordDonation("Campaign1", ethers.utils.parseEther("1"), "Education");
      await charityTracker.connect(addr2).recordDonation("Campaign2", ethers.utils.parseEther("2"), "Healthcare");
      await charityTracker.connect(addr1).recordDonation("Campaign3", ethers.utils.parseEther("3"), "Environment");

      // Get donations for addr1
      const addr1Donations = await charityTracker.getDonationsByDonor(addr1.address);

      // Check if we got the correct number of donations for addr1
      expect(addr1Donations.length).to.equal(2);
      
      // Verify the donations belong to addr1
      expect(addr1Donations[0].donor).to.equal(addr1.address);
      expect(addr1Donations[1].donor).to.equal(addr1.address);
    });
  });
});