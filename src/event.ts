import  {ethers}  from "ethers";
import { load } from "ts-dotenv";
import { abi_oracle } from "./abi";
import { insertOracleResponse } from "./postgre";
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

//This script won't stop till killed (Event Listener Worker)
export function hook_contract(): Promise<string> {
    return new Promise<string>((resolve, reject) => {  
        console.log("Start listening to events");

        contract.on("ResponseReceived", async (idx, data, event) => {
            try {
                console.log("Response" + data.toString());
                let datadecoded = await decodedata(data);
                insertOracleResponse(datadecoded.pair , datadecoded.value.toString()) // This will point my profile id to my response e.g 30001 Where 0003 is total mirros and 00001 it's total post 
                // TODO Function that decode the value then create an object {totalmirrors , totalpost} linked to the ProfileId
                resolve(data);
            } catch (err) {
                reject(err);
            }
        });
    })
    .finally(() => {
        // Only remove listeners here, don't destroy the provider
    });
}
async function decodedata(logdata: string) :Promise<{ reqId: number, pair: string, value: number }>{
   
    
    // Create an Interface using the ABI
    const iface = new ethers.utils.Interface(abi_oracle);
    
    // The log data you provided // Replace with your actual log data string
    
    // Decode the log data. Please note: you'd also typically need the topics array from the log for indexed parameters. 
    // But in your event, only non-indexed parameters are present. Thus, we can skip topics for this example.
    const decodedLog = iface.parseLog({
        data: logdata,
        topics: ["0xf9b3514f98ccd2df465094f95372549d36ff3e87827462e5395ff75ffed3d9ab"]
    });
    
    // Extract the values
    const { reqId, pair, value } = decodedLog.args;
    return { reqId: Number(reqId.toString()), pair: pair, value: Number(value.toString()) };
}
// Remember to close the WebSocket connection when it's not needed anymore
// provider.removeAllListeners();
// provider.destroy();
hook_contract();