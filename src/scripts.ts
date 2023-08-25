"use strict";

import express from "express";
import { ethers } from "ethers";
import { abi_oracle } from "./abi";
import { getProfileDetails } from './queries';
import { load } from "ts-dotenv";
const env = load({
    API_ENDPOINT:String ,
    PK:String,
    CONTRACT_ADDRESS_ORACLE:String,
});
// Your contract address (replace with your actual contract address)
const contractAddress = env.CONTRACT_ADDRESS_ORACLE;
// Mocking storing state 

type HashMap1 = {
    [key: string]: number[];
};

type HashMap2 = {
    [key: string]: number;
};

// Create and export the hashmaps
export const response_hashMap: HashMap1 = {};
export const hashMap2: HashMap2 = {};

// Connect to a provider (you may use a different provider if needed)
const provider = new ethers.JsonRpcProvider(env.API_ENDPOINT);
const wallet = new ethers.Wallet(env.PK, provider); // Remember to keep private keys secure, consider environment variables.

const contract = new ethers.Contract(contractAddress, abi_oracle, wallet);

//Submit the Request to the consumer contract
export async function RequestOracle(profileId: string) {
    const tx = await contract.reques(profileId);
    const receipt = await tx.wait();
    return receipt;
}

// Extract the data from the oracle response
export function extract_result(num: number): number[] {
    let str = String(num);
    return [
        Number(str.slice(0, 4)), // totalFollowers
        Number(str.slice(4, 8)), // totalFollowing
        Number(str.slice(8, 12)), // totalPost
        Number(str.slice(12, 16)), // totalComments
        Number(str.slice(16, 20)), // totalMirrors 
        Number(str.slice(20, 24)), //totalPublications
        Number(str.slice(24, 28)) // totalCollections 
    ];
}
// This search kudos available for claiming 
// What if here i pass the address and return the availables as a url for the image
//How to make a value pass for differente created conditions and return that url by performing certains call to the contracts uri created 
export function search_kudos(){

}

export function create_kudos(){

}