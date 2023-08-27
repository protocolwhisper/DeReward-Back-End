"use strict";

// ----------- Imports -------------
import { ethers } from "ethers";
import { load } from "ts-dotenv";
import { abi, abi_oracle } from "./abi";
import { Client } from 'pg';

// ----------- Type Definitions -------------
type HashMap1 = {
    [key: string]: number[];
};

type HashMap2 = {
    [key: string]: string;
};

export type Collection = {
    id: number;
    name: string;
    condition: string;
    stat: string;
    url: string;
};

// ----------- Constants & Globals -------------
const env = load({
    API_ENDPOINT: String,
    PK: String,
    CONTRACT_ADDRESS_ORACLE: String,
});

const contractAddress = env.CONTRACT_ADDRESS_ORACLE;

const provider = new ethers.providers.JsonRpcProvider(env.API_ENDPOINT);
const wallet = new ethers.Wallet(env.PK, provider);
const contract = new ethers.Contract(contractAddress, abi_oracle, wallet);

export let collectionIdCounter = 0;
export const rewards_collections: { [id: number]: Collection } = {};
export const response_hashMap: HashMap1 = {};
export const hashmap: HashMap2 = {};

// ----------- Functions -------------
export async function RequestOracle(profileId: string) {
    try {
        const tx = await contract.request(profileId);
        const receipt = await tx.wait();
        return receipt;
    } catch (error) {
        console.error('Error in RequestOracle:', error.message);
        throw error;
    }
}
export function extract_result(num: number): number[] {
    const str = num.toString();
    return [
        Number(str.slice(0, 4)),
        Number(str.slice(4, 8)),
        Number(str.slice(8, 12)),
        Number(str.slice(12, 16)),
        Number(str.slice(16, 20)),
        Number(str.slice(20, 24)),
        Number(str.slice(24, 28))
    ];
}



interface Result {
    totalPosts: number;
    totalMirrors: number;
}

export async function evaluateConditions(result: Result): Promise<{ matchingUrls: string[] }> {
    const matchingUrls: string[] = [];
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'user',  // Replace with your PostgreSQL username
        password: 'mysecretpassword',  // Replace with your PostgreSQL password
        database: 'mydatabase',  // Replace with your PostgreSQL database name
    });

    try {
        await client.connect();

        const fetchQuery = `SELECT * FROM rewards WHERE stat = '${result.totalPosts}${result.totalMirrors}';`;
        const queryResult = await client.query(fetchQuery);
        const collections = queryResult.rows;

        collections.forEach((collection) => {
            try {
                // Using a new Function for scope isolation and dynamic evaluation
                const evaluate = new Function("x", `return ${collection.condition}`);
                if (evaluate(result)) {
                    matchingUrls.push(collection.url);
                }
            } catch (error) {
                console.error(`Failed to evaluate condition for collection ${collection.name}: ${error.message}`);
            }
        });

        return { matchingUrls };
    } catch (err) {
        console.error("Error:", err.message);
        throw err;
    } finally {
        await client.end();
    }
}


export function getContractInstance(contractAddress: string) {
    // Use your web3 or ethers provider and ABI to create the contract instance
    // I'm assuming you're using ethers here
    const provider = new ethers.providers.JsonRpcProvider(env.API_ENDPOINT); // or your specific provider
    const contract = new ethers.Contract(contractAddress, abi, provider);
    return contract;
}
///Mocks 
export const CONTRACT_ADDRESSES = {
    1: '0xCeE57d55b9d306b715f60b0C251DFBE66f39a502',
    2: '0x2772FC8442fD6bB53554F6440014930c6D552d89',
    3: '0xb2766648A68CFb64b2700d9e4e6e331C1E230d87'
};

export const URL_TO_CONTRACT_MAPPING = {
    "https://bafkreid43s42sb77nctfw6ypjyg3usadlkiw6gwv4sradsy2tn6oionpzy.ipfs.nftstorage.link/": CONTRACT_ADDRESSES[1],
    "https://bafkreiah4mec2zjfdac4kijy7r4ycy6sfongd3qewrm6hfj6nzu6i4mhmu.ipfs.nftstorage.link/": CONTRACT_ADDRESSES[2],
    "https://bafkreibbr3bae6cjujj3mjbkhbq2yikilyssltoetwj2ahwuucnlcrzoia.ipfs.nftstorage.link/": CONTRACT_ADDRESSES[3]
};

export function getContractAddressFromUrl(url: string): string | undefined {
    return URL_TO_CONTRACT_MAPPING[url];
}

// Parsing the oracle response 

export function parseString(input) {
    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }

    return {
        totalPosts: parseInt(input.charAt(0), 10),
        totalMirrors: parseInt(input.charAt(4), 10)
    };
}
