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
const provider = new ethers.providers.WebSocketProvider(wsProviderUrl , network)
// Create a contract instance
const contract = new ethers.Contract(env.CONTRACT_ADDRESS_ORACLE, abi_oracle, provider);


// This will listen for the events of our Consumer Oracle
export async function hook_contract(caller_address:string) {
    contract.on("ResponseReceived", (reqId, pair, value, event) => {

        response_hashMap['caller_address'] = value; // Addy -> Response  This value needs to be formatted
        console.log("Response Stored")
        // event` argument ??
        console.log(`Transaction Hash: ${event.transactionHash}`);
        return event.transactionHash
    });
    provider.removeAllListeners();
    provider.destroy();
}

// Remember to close the WebSocket connection when it's not needed anymore
// provider.removeAllListeners();
// provider.destroy();
