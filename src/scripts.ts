"use strict";

// ----------- Imports -------------
import { ethers } from "ethers";
import { load } from "ts-dotenv";
import { abi_oracle } from "./abi";

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

export function evaluateConditions(x: any): number[] {
    const indices: number[] = [];

    Object.values(rewards_collections).forEach((collection, index) => {
        try {
            // Using a new Function for scope isolation and dynamic evaluation
            const evaluate = new Function("x", `return ${collection.condition}`);
            if (evaluate(x)) {
                indices.push(index);
            }
        } catch (error) {
            console.error(`Failed to evaluate condition for collection ${collection.name}: ${error.message}`);
        }
    });

    return indices;
}
