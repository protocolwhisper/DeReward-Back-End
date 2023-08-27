import { Client } from 'pg';

export const checkConnection = async () => {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'user',  // Replace with your PostgreSQL username
        password: 'mysecretpassword',  // Replace with your PostgreSQL password
        database: 'mydatabase',  // Replace with your PostgreSQL database name
    });

    try {
        await client.connect();
        console.log('Successfully connected to port 5432');
    } catch (err) {
        console.error('Failed to connect to port 5432:', err.message);
    } finally {
        await client.end();
    }
};

export const createTableone = async () => {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'user',  // Replace with your PostgreSQL username
        password: 'mysecretpassword',  // Replace with your PostgreSQL password
        database: 'mydatabase',  // Replace with your PostgreSQL database name
    });
    try {
        await client.connect();
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS profiles (
                profileid VARCHAR(255) PRIMARY KEY,
                response TEXT NOT NULL
            );
        `;

        await client.query(createTableQuery);
        console.log("Table 'profiles' created successfully!");
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await client.end();
    }
};

export const createTableTwo = async () => {
    // Will store the collection names and conditions 
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'user',  // Replace with your PostgreSQL username
        password: 'mysecretpassword',  // Replace with your PostgreSQL password
        database: 'mydatabase',  // Replace with your PostgreSQL database name
    });

    try {
        await client.connect();

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS rewards (
                id SERIAL PRIMARY KEY, 
                name VARCHAR(255) NOT NULL,
                condition TEXT NOT NULL,
                stat VARCHAR(255) NOT NULL,
                url TEXT NOT NULL
            );
        `;

        await client.query(createTableQuery);
        console.log("Table 'rewards' created successfully!");

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await client.end();
    }
};

export interface Collection {
    id: number;
    name: string;
    condition: string;
    stat: string;
    url: string;
}

export const insertCollectionReward = async (collection: Collection): Promise<boolean> => {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'user',  // Replace with your PostgreSQL username
        password: 'mysecretpassword',  // Replace with your PostgreSQL password
        database: 'mydatabase',  // Replace with your PostgreSQL database name
    });

    try {
        await client.connect();

        const insertQuery = `
            INSERT INTO rewards (id, name, condition, stat, url) 
            VALUES ($1, $2, $3, $4, $5);
        `;

        const values = [collection.id, collection.name, collection.condition, collection.stat, collection.url];
        
        await client.query(insertQuery, values);
        
        return true;  // Successfully inserted
    } catch (err) {
        console.error("Error:", err.message);
        return false;  // Insertion failed
    } finally {
        await client.end();
    }
};
export const insertOracleResponse = async (profileid: string, response: string): Promise<boolean> => {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'user',  // Replace with your PostgreSQL username
        password: 'mysecretpassword',  // Replace with your PostgreSQL password
        database: 'mydatabase',  // Replace with your PostgreSQL database name
    });
    try {
        await client.connect();
        
        // Inserting data
        await client.query('INSERT INTO profiles(profileid, response) VALUES($1, $2) ON CONFLICT(profileid) DO UPDATE SET response = $2', [profileid, response]);
        return true; // Successfully inserted/updated
    } catch (err) {
        console.error('Error:', err.message);
        return false; // Failed to insert/update
    } finally {
        await client.end();
    }
};

export const fetchOracleResponse = async (profileid: string): Promise<string | null> => {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'user',  // Replace with your PostgreSQL username
        password: 'mysecretpassword',  // Replace with your PostgreSQL password
        database: 'mydatabase',  // Replace with your PostgreSQL database name
    });
    try {
        await client.connect();
        
        // Fetching data
        const res = await client.query('SELECT response FROM profiles WHERE profileid = $1', [profileid]);
        if (res.rows.length > 0) {
            return res.rows[0].response; // Return the fetched response
        } else {
            return null; // No data found
        }
    } catch (err) {
        console.error('Error:', err.message);
        return null; // Error occurred
    } finally {
        await client.end();
    }
};

async function testingdb() {
    // Simple testing for the db
   // checkConnection();
   // await createTable();
    const isSuccess = await insertOracleResponse("profile1234", "0x00000000000000000000000000000000000000000000000000000000000000000000000");
    console.log(isSuccess ? "Inserted successfully" : "Insertion failed");

    const response = await fetchOracleResponse("profile1234");
    if(response) {
    console.log("Fetched response:", response);
    } else {
    console.log("No response found or an error occurred.");
    }
}

export function create_all(){
    createTableone();
    createTableTwo();
}

//testingdb();