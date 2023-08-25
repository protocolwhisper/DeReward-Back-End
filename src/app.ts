"use strict";

import express from "express";
import { ethers } from "ethers";
import { abi } from "./abi";
import { getProfileDetails } from './queries';
import { load } from "ts-dotenv";
import { response_hashMap } from "./scripts";
const env = load({
    API_ENDPOINT:String ,
    PK:String,
    CONTRACT_ADDRESS:String,
});
// Your contract address (replace with your actual contract address)
const contractAddress = env.CONTRACT_ADDRESS;

// Connect to a provider (you may use a different provider if needed)
const provider = new ethers.JsonRpcProvider(env.API_ENDPOINT);
const wallet = new ethers.Wallet(env.PK, provider); // Remember to keep private keys secure, consider environment variables.

const contract = new ethers.Contract(contractAddress, abi, wallet);

const app = express();
const port = 3001;
let tokenid = 0;

// Middleware to parse JSON body
app.use(express.json());

app.post('/mint', async (req, res) => {
    const { ethereumAddress } = req.body;

    if (!ethereumAddress) {
        return res.status(400).send('Ethereum address is required.');
    }

    try {
        // Call your contract's mint function
        const tx = await contract.mint(ethereumAddress, (tokenid + 1), 1, "0x");
        const receipt = await tx.wait();
        res.json({
            transactionHash: tx.hash,
            confirmation: 'Transaction has been confirmed!',
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        console.error('Error sending transaction:', error);
        res.status(500).send('Error sending transaction.');
    }
});

app.get('/checkprofile', async (req, res) => {
    const ethereumAddress = req.query.ethereumAddress as string;

    if (!ethereumAddress) {
        return res.status(400).send('Please provide an ethereumAddress as a query parameter.');
    }

    try {
        const profileDetails = await getProfileDetails(ethereumAddress);
        if (!profileDetails) {
            return res.status(404).send('Profile not found or there was an error fetching details.');
        }
        res.json(profileDetails);
    } catch (error) {
        res.status(500).send('Internal server error.');
    }
});

//What are u trying to query here

app.post('/query_oracle', async (req, res) => {
    const { ethereumAddress } = req.body;

    if (!ethereumAddress) {
        return res.status(400).send('Ethereum address is required.');
    }

    try {
        let consistency = {
            exists: (address: string) => !!response_hashMap[address]
        };
        
        if (consistency.exists(ethereumAddress)) {
            console.log("The address exists in the result_hashMap.");
        } else {
            console.log("The address does not exist in the result_hashMap.");
        }
        
        const tx = await contract.mint(ethereumAddress, (tokenid + 1), 1, "0x");
        const receipt = await tx.wait();
        res.json({
            transactionHash: tx.hash,
            confirmation: 'Transaction has been confirmed!',
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        console.error('Error sending transaction:', error);
        res.status(500).send('Error sending transaction.');
    }
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
