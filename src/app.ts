"use strict";

import express from "express";
import { ethers } from "ethers";
import { abi } from "./abi";
import { fetchProfileId } from './queries';
import { load } from "ts-dotenv";
import { Collection, RequestOracle, collectionIdCounter, evaluateConditions, response_hashMap , rewards_collections } from "./scripts";
import { Counter } from './counter';
import { hook_contract } from "./event";

const counterInstance = Counter.getInstance();

const env = load({
    API_ENDPOINT: String,
    PK: String,
    CONTRACT_ADDRESS: String,
    // Assuming you might want to load the WebSocket endpoint in the future.
});

const contractAddress = env.CONTRACT_ADDRESS;
const provider = new ethers.providers.JsonRpcProvider(env.API_ENDPOINT);
const wallet = new ethers.Wallet(env.PK, provider);

const contract = new ethers.Contract(contractAddress, abi, wallet);

const app = express();
const port = 3001;

app.use(express.json());

app.post('/mint', async (req, res) => {
    const { ethereumAddress } = req.body;

    if (!ethereumAddress) {
        return res.status(400).send('Ethereum address is required.');
    }

    try {
        const tx = await contract.mint(ethereumAddress, 1, "0x");
        const receipt = await tx.wait();
        res.status(201).json({
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
        const profileDetails = await fetchProfileId(ethereumAddress);
        if (!profileDetails) {
            return res.status(404).send('Address has not been invited to lens.');
        }

        const request = await RequestOracle(profileDetails);
        console.log('Receipt of Request' + request);
        const tx_hook = await hook_contract(ethereumAddress);
        console.log('Event Extracted' + tx_hook);
        const tx_result = response_hashMap[ethereumAddress];

        const tx_str = tx_result.toString().padStart(8, '0');
        const firstValue = tx_str.slice(0, 4);
        const secondValue = tx_str.slice(4);

        const dropone = evaluateConditions(firstValue);
        const droptwo = evaluateConditions(secondValue);

        const metadata = rewards_collections[dropone[0]];
        const metadatatwo = rewards_collections[droptwo[0]];

        const urlForMetadata = metadata.url;
        const urlForMetadatatwo = metadatatwo.url;

        res.json({
            urlForMetadata,
            urlForMetadatatwo
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error.');
    }
});

app.post('/create_reward', async (req, res) => {
    const { CollectionName, Condition, stat, reward_url } = req.body;

    try {
        const newCollection: Collection = {
            id: counterInstance.value,
            name: CollectionName,
            condition: Condition,
            stat: stat,
            url: reward_url
        };

        rewards_collections[collectionIdCounter] = newCollection;
        counterInstance.increment();
        
        res.status(201).json({
            message: "Instance created successfully!",
            collectionName: CollectionName
        });

    } catch (error) {
        console.error('Error sending transaction:', error);
        res.status(500).send('Error sending transaction.');
    }
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
