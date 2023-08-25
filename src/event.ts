import  ethers  from "ethers";
import { load } from "ts-dotenv";
import { abi_oracle } from "./abi";
import {extract_result} from "./scripts"
import { response_hashMap } from "./scripts"; //Store
const env = load({
    API_ENDPOINT:String ,
    PK:String,
    CONTRACT_ADDRESS_ORACLE:String,

});
// Connect to a WebSocket provider
const wsProviderUrl = "wss://YOUR_ETHEREUM_NODE_URL"; ///Ojo
const provider = new ethers.WebSocketProvider(wsProviderUrl , "mumbai");
// Create a contract instance
const contract = new ethers.Contract(env.CONTRACT_ADDRESS_ORACLE, abi_oracle, provider);


// This will listen for the events of our Consumer Oracle
async function hook_contract(caller_address:string) {
    contract.on("MessageProcessedTo", (noname, event) => {
        console.log(`noname: ${noname.toString()}`);
        let response = extract_result(noname);
        response_hashMap['caller_address'] = response; // Addy -> Response
        // event` argument ??
        console.log(`Transaction Hash: ${event.transactionHash}`);
    });
    provider.removeAllListeners();
    provider.destroy();
}

// Remember to close the WebSocket connection when it's not needed anymore
// provider.removeAllListeners();
// provider.destroy();
