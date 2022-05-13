const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const Referendum = await hre.ethers.getContractFactory("Referendum");
  const referendum = await Referendum.deploy();

  await referendum.deployed();

  console.log("Blog deployed to:", referendum.address);

  fs.writeFileSync(
    "./config.js",
    `
  export const contractAddress = "${referendum.address}"
  export const ownerAddress = "${referendum.signer.address}"
  `
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
