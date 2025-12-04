const hre = require("hardhat");

async function main() {
    const StampVerifier = await hre.ethers.getContractFactory("StampVerifier");
    const stampVerifier = await StampVerifier.deploy();

    await stampVerifier.deployed();

    console.log("StampVerifier deployed to:", stampVerifier.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
