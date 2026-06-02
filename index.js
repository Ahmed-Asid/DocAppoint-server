const dns = require("node:dns");
dns.setServers(["8.8.8.8","8.8.4.4"]);

const express = require('express');
const dotenv = require('dotenv');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

dotenv.config();

const uri = process.env.MONGODB_URI;

const app = express();

const cors = require('cors')
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db('doc-appoint');
    const appointments = db.collection('appointments');

    app.post('/api/appointments', async(req, res) => {
    const newAppointment = req.body;
    const result = await appointments.insertOne(newAppointment);
    res.json(result);
    })

    app.get('/api/appointments', async(req, res) => {
        const cursor = appointments.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.delete('/api/appointments/:id', async(req, res) => {
        const id = req.params.id;
        const query = {
            _id : new ObjectId(id)
        }
        const result = await appointments.deleteOne(query);
        res.send(result)
    })

    app.get('/api/appointments/:id', async(req, res) => {
        const id = req.params.id;
        const query = { userId: id }
        const result = await appointments.find(query).toArray();
        res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.log(error)
  }
}
run().catch(console.dir);

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