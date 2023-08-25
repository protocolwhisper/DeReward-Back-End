import  {ethers}  from "ethers";
import { load } from "ts-dotenv";
import { abi_oracle } from "./abi";
import {extract_result} from "./scripts" // 
import { response_hashMap } from "./scripts"; //Store
const env = load({
    API_ENDPOINT: String ,
    PK:String,
    CONTRACT_ADDRESS_ORACLE: String,
    WS_ENDPOINT: String,

});
// Connect to a WebSocket provider
const wsProviderUrl = env.WS_ENDPOINT; ///Ojo  <---
const network = {
    name: "mumbai", 
    chainId: 80001  // Mumbai's chain ID
};
const provider = new ethers.WebSocketProvider(wsProviderUrl , network)
// Create a contract instance
const contract = new ethers.Contract(env.CONTRACT_ADDRESS_ORACLE, abi_oracle, provider);


// This will listen for the events of our Consumer Oracle
export function hook_contract(caller_address: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {  // Note the <number> generic here
        contract.on("ResponseReceived", (reqId, pair, value, event) => {
            try {
                // Use the variable caller_address, not the string 'caller_address'
                response_hashMap[caller_address] = value;

                console.log("Response" + value.toString());

                const numericValue = Number(value);
                if (isNaN(numericValue)) {
                    reject(new Error("Received value is not a valid number."));
                } else {
                    // Resolve the promise with the number value
                    resolve(numericValue);
                }
            } catch (err) {
                reject(err);
            }
        });

        // Optionally, if there's a timeout or other criteria to consider the operation failed, you can reject the promise.
        setTimeout(() => {
            reject(new Error("Timeout waiting for ResponseReceived event."));
        }, 30000);
    })
    .finally(() => {
        // It might still be problematic to remove listeners and destroy the provider without further context.
        // So, use this with caution.
        provider.removeAllListeners();
        provider.destroy();
    });
}

// Remember to close the WebSocket connection when it's not needed anymore
// provider.removeAllListeners();
// provider.destroy();
