const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const tasksCollection = db.collection('tasks')

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

    //  save task in db
      app.post('/tasks', async (req, res) => {
        const taskData  = req.body
        const result = await tasksCollection.insertOne({...taskData,timestamp: Date.now()})
        // console.log(result)
        res.send(result)
      })
  
      app.get('/tasks/:email', async(req, res) => {
        const result = await tasksCollection.find().toArray()
        res.send(result)
      })
  
  
      app.delete('/tasks/:id', async(req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id)}
        const result = await tasksCollection.deleteOne(query)
        res.send(result)
      })
  
      app.get('/tasks/:id', async(req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await tasksCollection.findOne(query)
        res.send(result)
      })
  
      app.put('/tasks/:id', async (req, res) => {
        const id = req.params.id
        const taskData  = req.body
        const updated = {
          $set: taskData,
        }
        const query = { _id: new ObjectId(id) }
        const options = { upsert: false }
        const result = await tasksCollection.updateOne(query, updated, options)
        res.send(result)
      })

    
   app.patch("/tasks/:id/category", async (req, res) => {
      try {
    const { category } = req.body;
    if (!["To-Do", "In Progress", "Done"].includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { category },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
});


      
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
