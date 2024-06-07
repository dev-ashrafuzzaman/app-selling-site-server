const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.DATABASE;

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to DB");
    db = client.db("ecommerce"); 
  } catch (error) {
    console.error("Error connecting to DB:", error);
    throw error;
  }
}

function getDatabase() {
  if (!db) {
    throw new Error("You must call connectToDatabase first before accessing the database");
  }
  return db;
}

module.exports = {
  connectToDatabase,
  getDatabase,
};