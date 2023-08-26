"use strict";

import express from "express";
import { ethers } from "ethers";
import { abi } from "./abi";
import { fetchProfileId, getRandomInt, getRandomUrls, urls } from './queries';
import { load } from "ts-dotenv";
import { CONTRACT_ADDRESSES, Collection, RequestOracle, URL_TO_CONTRACT_MAPPING, collectionIdCounter, evaluateConditions, getContractInstance, response_hashMap , rewards_collections } from "./scripts";
import { Counter } from './counter';
import { hook_contract } from "./event";
import { fetchOracleResponse, insertCollectionReward } from "./postgre";

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
// Mock mint 
app.post('/mock_mint', async (req, res) => {
    const { ethereumAddress, url } = req.body;  // Receive a URL instead of an option

    if (!ethereumAddress) {
        return res.status(400).send('Ethereum address is required.');
    }

    const contractAddress = URL_TO_CONTRACT_MAPPING[url];  // Look up the contract address using the URL
    if (!contractAddress) {
        return res.status(400).send('Invalid URL or URL not mapped to a contract address.');
    }

    // Assuming you have a function to get a contract instance
    const contract = getContractInstance(contractAddress); 

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

//Mock profile validation
app.get('/mock_check', async (req, res) => {

    const ethereumAddress = req.query.ethereumAddress as string;

    if (!ethereumAddress) {
        return res.status(400).send('Please provide an ethereumAddress as a query parameter.');
    }

    const profileDetails = await fetchProfileId(ethereumAddress);
    if (!profileDetails) {
        return res.status(404).send('Address has not been invited to lens.');
    }

    const randomnumber = getRandomInt(1 , urls.length)

    // Fetching 2 random URLs for demonstration. Adjust the count as needed.
    const randomUrls = getRandomUrls(randomnumber);
    
    // Constructing the response format based on your TODO. Adjust as needed.
    const formattedResponse = randomUrls.map(url => url.split('://')[1]).join(', ');

    return res.status(200).send(formattedResponse);  // Example: 'example1.com, example2.com'
});

// Consuming Lens Api Oracle
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
        //We send our request to the consumer Oracle
        const request = await RequestOracle(profileDetails);
        console.log('Receipt of Request' + request);
        // Consume the response 
        let codedvalue = fetchOracleResponse(profileDetails)
        // Call function that decode the values and return me an object with two values totalpost , total mirrors


        
        const tx_result = response_hashMap[ethereumAddress];

        const tx_str = tx_result.toString().padStart(8, '0');
        const firstValue = tx_str.slice(0, 4);
        const secondValue = tx_str.slice(4);
        // Here we evaluate that my response meet some of the conditions of the drops created if so return me the .url of the creation 
        const dropone = evaluateConditions(firstValue); // This will need refactor
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
    // Remember you are using a counter class
    try {
        const newCollection: Collection = {
            id: counterInstance.value, // Key: assuming they would be a fair amount of creations 
            name: CollectionName,
            condition: Condition,
            stat: stat,
            url: reward_url
        };

        let consumer = await insertCollectionReward(newCollection);
        if(consumer == false){
            res.status(500).send('Error sending transaction.');
        }
        else{
            res.status(201).json({
                message: "Instance created successfully!",
                collectionName: CollectionName
            });
            counterInstance.increment();
        }
    } catch (error) {
        console.error('Error sending transaction:', error);
        res.status(500).send('Error sending transaction.');
    }
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
