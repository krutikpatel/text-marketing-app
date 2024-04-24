const MongoClient = require('mongodb').MongoClient;

class MongoDBHelper {
    constructor(uri) {
        this.uri = uri;
        this.client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    async connect() {
        try {
            await this.client.connect();
        } catch (error) {
            console.error(`Error connecting to MongoDB: ${error}`);
        }
    }

    async close() {
        try {
            await this.client.close();
        } catch (error) {
            console.error(`Error closing MongoDB connection: ${error}`);
        }
    }

    async find(database, collection, query) {
        try {
            const result = await this.client.db(database).collection(collection).find(query).toArray();
            return result;
        } catch (error) {
            console.error(`Error finding documents: ${error}`);
        }
    }

    async insert(database, collection, document) {
        try {
            const result = await this.client.db(database).collection(collection).insertOne(document);
            return result;
        } catch (error) {
            console.error(`Error inserting document: ${error}`);
        }
    }
}

module.exports = MongoDBHelper;