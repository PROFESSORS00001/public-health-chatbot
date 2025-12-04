// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StampVerifier {
    // Mapping from stamp hash to boolean (true if valid)
    mapping(string => bool) public validStamps;
    
    event StampCreated(string stamp, uint256 timestamp);

    // Function to record a new stamp (only owner/bot should call this in real app)
    function recordStamp(string memory stamp) public {
        validStamps[stamp] = true;
        emit StampCreated(stamp, block.timestamp);
    }

    // Function to verify if a stamp is valid
    function verify(string memory stamp) public view returns (bool) {
        return validStamps[stamp];
    }
}
