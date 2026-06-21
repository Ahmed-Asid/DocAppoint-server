const dns = require("node:dns");
dns.setServers(["8.8.8.8","8.8.4.4"]);

const express = require('express');
const dotenv = require('dotenv');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

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

const JWKS = createRemoteJWKSet(
  new URL("http://localhost:3000/api/auth/jwks")
)

const verifyToken = async(req, res, next) => {
  const token = req?.headers.authorization

  if (!token) {
    return res.status(401).json({ message : "Unauthorized"})
  }

  try {
    const {payload} = await jwtVerify(token, JWKS)
  console.log(payload)
  next()
  } catch {
    return res.status(403).json({ message: "Forbidden" })
  }
}

async function run() {
  try {
    await client.connect();

    const db = client.db('doc-appoint');
    const appointments = db.collection('appointments');
    const users = db.collection('user');

    app.get('/api/users', async(req, res) => {
        const cursor = users.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/api/users/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await users.find(query).toArray();
        res.send(result)
    })

    app.patch('/api/users/:id',verifyToken, async(req,res) => {
      const id = req.params.id;
      const userData = req.body;

//       console.log(id)
// console.log(`http://localhost:8000/api/users/${id}`)
//       console.log(userData)

      const result = await users.updateOne(
        {_id: new ObjectId(id)},
        {$set : userData}
      )
      res.send(result)
    })


    app.post('/api/appointments',verifyToken, async(req, res) => {
    const newAppointment = req.body;
    const result = await appointments.insertOne(newAppointment);
    res.json(result);
    })

    app.get('/api/appointments',verifyToken, async(req, res) => {
        const cursor = appointments.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.delete('/api/appointments/:id',verifyToken, async(req, res) => {
        const id = req.params.id;
        const query = {
            _id : new ObjectId(id)
        }
        const result = await appointments.deleteOne(query);
        res.send(result)
    })

    app.patch('/api/appointments/:id', verifyToken, async(req, res) => {
        const id = req.params.id;
        const updatedData = req.body;

        const result = await appointments.updateOne(
          {_id : new ObjectId(id)},
          {$set : updatedData}
        );
        res.send(result)
    })

    app.get('/api/appointments/:id', verifyToken, async(req, res) => {
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

app.get('/api/doctors/:id', verifyToken,  async(req, res) => {

    const id = req.params.id;
    const doc = await data.find(d => d.id === id);
    res.send(doc);
});


app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})