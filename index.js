const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zl0p4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const db = client.db('Task')
    const usersCollection = db.collection('users')

    // save user in db

    app.post('/users/:email', async(req, res) => {
        const email = req.params.email
        const query = { email }
        const user = req.body
        const isExist = await usersCollection.findOne(query)
        if(isExist){
          return res.send(isExist)
        }
        const result = await usersCollection.insertOne({...user, timestamp: Date.now()})
        res.send(result)
      })

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hello from task..')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
