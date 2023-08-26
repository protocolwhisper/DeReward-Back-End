import { ethers } from "ethers";
import { abi_oracle } from "../abi";
import { load } from "ts-dotenv";

const env = load({
    API_ENDPOINT: String,
    PK: String,
    CONTRACT_ADDRESS_ORACLE: String,
});

const contractAddress = env.CONTRACT_ADDRESS_ORACLE;
const provider = new ethers.providers.JsonRpcProvider(env.API_ENDPOINT);
const wallet = new ethers.Wallet(env.PK, provider);
const contract = new ethers.Contract(contractAddress, abi_oracle, wallet);

async function main() {
    try {
        const tx = await contract.request("0x1f4b");
        const receipt = await tx.wait();

        console.log({
            transactionHash: tx.hash,
            confirmation: 'Transaction has been confirmed!',
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main();
