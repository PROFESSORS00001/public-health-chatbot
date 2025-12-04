const crypto = require('crypto');

// Mock Blockchain Interaction for MVP
// In a real app, this would use ethers.js to write to a smart contract

function generateStamp(messageContent) {
    // Create a hash of the message + timestamp
    const data = messageContent + Date.now().toString();
    const hash = crypto.createHash('sha256').update(data).digest('hex');

    // Return a short "stamp" (first 10 chars of hash) formatted like a contract address
    // This simulates a transaction hash or unique ID on-chain
    return '0x' + hash.substring(0, 10);
}

module.exports = { generateStamp };
