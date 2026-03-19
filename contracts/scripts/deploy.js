const hre = require("hardhat");

async function main() {
  console.log("Deploying BaseEscrow to Base Mainnet...");

  const BaseEscrow = await hre.ethers.getContractFactory("BaseEscrow");
  const escrow = await BaseEscrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();

  console.log("\nDeployment completed!");
  console.log("ESCROW_ADDRESS (Mainnet):", escrowAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
