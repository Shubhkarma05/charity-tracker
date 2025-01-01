// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityTracker {
    // Struct to store donation details
    struct Donation {
        address donor;
        string campaignId;
        uint256 amount;
        uint256 timestamp;
        string purpose;
    }

    // Array to store all donations
    Donation[] public donations;

    // Event to log donations
    event DonationRecorded(
        address indexed donor,
        string campaignId,
        uint256 amount,
        uint256 timestamp,
        string purpose
    );

    // Function to record a donation
    function recordDonation(
        string memory _campaignId,
        uint256 _amount,
        string memory _purpose
    ) public {
        // Add the donation to the donations array
        donations.push(Donation({
            donor: msg.sender,
            campaignId: _campaignId,
            amount: _amount,
            timestamp: block.timestamp,
            purpose: _purpose
        }));

        // Emit an event to log the donation
        emit DonationRecorded(
            msg.sender, 
            _campaignId, 
            _amount, 
            block.timestamp, 
            _purpose
        );
    }

    // Function to get all donations
    function getDonations() public view returns (Donation[] memory) {
        return donations;
    }

    // Function to get donations by donor address
    function getDonationsByDonor(address _donor) public view returns (Donation[] memory) {
        uint256 count = 0;
        
        // Count donations by the specified donor
        for (uint256 i = 0; i < donations.length; i++) {
            if (donations[i].donor == _donor) {
                count++;
            }
        }

        // Create a new array to store the filtered donations
        Donation[] memory result = new Donation[](count);
        uint256 index = 0;

        // Add the donations from the specified donor to the result array
        for (uint256 i = 0; i < donations.length; i++) {
            if (donations[i].donor == _donor) {
                result[index] = donations[i];
                index++;
            }
        }

        return result;
    }
}