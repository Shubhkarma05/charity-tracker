// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityTracker {
    // Struct to store campaign details
    struct Campaign {
        string campaignId;
        string title;
        string description;
        address organizer;
        uint256 goalAmount;
        uint256 raisedAmount;
        uint256 startTime;
        uint256 endTime;
        bool completed;
    }

    // Struct to store donation details
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        string purpose;
    }

    // Struct to store expense details
    struct Expense {
        uint256 amount;
        uint256 timestamp;
        string purpose;
    }

    // Mappings
    mapping(string => Campaign) public campaigns;
    mapping(string => Donation[]) public campaignDonations;
    mapping(string => Expense[]) public campaignExpenses;

    // Events
    event CampaignCreated(string campaignId, address indexed organizer);
    event DonationRecorded(address indexed donor, string campaignId, uint256 amount, uint256 timestamp, string purpose);
    event ExpenseAdded(string campaignId, uint256 amount, uint256 timestamp, string purpose);

    // Function to create a campaign
    function createCampaign(
        string memory _campaignId,
        string memory _title,
        string memory _description,
        uint256 _goalAmount,
        uint256 _endTime
    ) public {
        require(campaigns[_campaignId].goalAmount == 0, "Campaign ID already exists");
        require(_goalAmount > 0, "Goal amount must be greater than zero");
        require(_endTime > block.timestamp, "End time must be in the future");

        campaigns[_campaignId] = Campaign({
            campaignId: _campaignId,
            title: _title,
            description: _description,
            organizer: msg.sender,
            goalAmount: _goalAmount,
            raisedAmount: 0,
            startTime: block.timestamp,
            endTime: _endTime,
            completed: false
        });

        emit CampaignCreated(_campaignId, msg.sender);
    }

    // Function to record a donation
    function recordDonation(
        string memory _campaignId,
        uint256 _amount,
        string memory _purpose
    ) public payable {
        require(campaigns[_campaignId].goalAmount > 0, "Invalid campaign ID");
        require(block.timestamp <= campaigns[_campaignId].endTime, "Campaign has ended");
        require(!campaigns[_campaignId].completed, "Campaign is completed");
        require(msg.value == _amount, "Donation amount mismatch");

        campaigns[_campaignId].raisedAmount += _amount;

        if (campaigns[_campaignId].raisedAmount >= campaigns[_campaignId].goalAmount) {
            campaigns[_campaignId].completed = true;
        }

        campaignDonations[_campaignId].push(Donation({
            donor: msg.sender,
            amount: _amount,
            timestamp: block.timestamp,
            purpose: _purpose
        }));

        emit DonationRecorded(msg.sender, _campaignId, _amount, block.timestamp, _purpose);
    }

    // Function to add an expense
    function addExpense(
        string memory _campaignId,
        uint256 _amount,
        string memory _purpose
    ) public {
        require(msg.sender == campaigns[_campaignId].organizer, "Only organizer can add expenses");
        require(campaigns[_campaignId].raisedAmount >= _amount, "Insufficient funds");

        campaigns[_campaignId].raisedAmount -= _amount;

        campaignExpenses[_campaignId].push(Expense({
            amount: _amount,
            timestamp: block.timestamp,
            purpose: _purpose
        }));

        emit ExpenseAdded(_campaignId, _amount, block.timestamp, _purpose);
    }

    // Function to withdraw funds
    function withdrawFunds(string memory _campaignId) public {
        require(msg.sender == campaigns[_campaignId].organizer, "Only organizer can withdraw");
        require(campaigns[_campaignId].completed, "Campaign is not completed");

        uint256 balance = campaigns[_campaignId].raisedAmount;
        campaigns[_campaignId].raisedAmount = 0;

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
    }

    // Function to get all donations for a campaign
    function getDonations(string memory _campaignId) public view returns (Donation[] memory) {
        return campaignDonations[_campaignId];
    }

    // Function to get all expenses for a campaign
    function getExpenses(string memory _campaignId) public view returns (Expense[] memory) {
        return campaignExpenses[_campaignId];
    }
}



