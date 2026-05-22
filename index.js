const dns = require("node:dns");
dns.setServers(["8.8.8.8","8.8.4.4"]);

const express = require('express');
const dotenv = require('dotenv');

const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();

const uri = process.env.MONGODB_URI;

const app = express();

// const fs = require('fs');
// const path = require('path');

const cors = require('cors')
const port = process.env.PORT;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.use(cors());
app.use(express.json());

const data = require('./data/db.json');

app.get('/api/doctors', (req, res) => {
    res.send(data);
});

app.get('/api/doctors/:id', (req, res) => {

    const id = req.params.id;
    console.log(id)
    const doc = data.find(d => d.id === id);
    console.log(doc)
    res.send(doc);
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})