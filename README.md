# Dereward⭐ System

The Dereward⭐ system is designed to listen to events from the consumer contract on the Phala network, store them in a PostgreSQL database, and evaluate conditions to determine if a user can mint a reward collection.

## System Diagram

![Insert your diagram here](https://bafkreibxnfpwaz6nvpkr42hw2sgpodzkaywvafpuioh6trxjd7qc5dybe4.ipfs.nftstorage.link/)

## System Overview

- **User Query**: A user queries the consumer with a request using an Ethereum address.
- **Lens ID Retrieval**: The system retrieves the lens ID associated with the Ethereum address by querying the GraphQL from lens.dev. (Note: There's a plan to implement this on the Phala network).
- **Event Listening**: A worker listens for the response event from the consumer contract.
- **Data Storage**: Once the event is captured, the worker stores the event data in a PostgreSQL database.
- **Data Decoding**: The system then decodes the values from the event log to retrieve `${totalPosts}` and `${totalMirrors}`.
- **Condition Evaluation**: These values are then queried against the `stat` field in one or more reward collections.
- **Minting Decision**: If the conditions match, the system determines which collections the user can mint. If not, the user cannot mint any collections.

## Running the System

To run the system, execute the `init.sh` script:

```bash
./init.sh
```

You should see an output like this :
![Output](https://bafkreicbnuadtlz4k67hxjqkxoz7bynml6fphaq2esybgdvjg2ilo6sptq.ipfs.nftstorage.link/)

## About DeReward ⭐

Dereward⭐ is a reward minting system that evaluates user activities and conditions to determine eligibility for minting specific collections. By integrating with the Phala network and storing event data in a PostgreSQL database, it ensures a seamless and efficient workflow for users and administrators alike.
