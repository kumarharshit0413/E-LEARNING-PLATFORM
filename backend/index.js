const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

const uri = process.env.MONGO_URI;

// Use the modern serverApi configuration
const clientOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
};

const client = new MongoClient(uri, clientOptions);
const dbName = 'elearning';

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    const db = client.db(dbName);

    // User Routes
    const userRoutes = require('./routes/user')(db);
    app.use('/api/users', userRoutes);

    // Course Routes
    const courseRoutes = require('./routes/course')(db);
    app.use('/api/courses', courseRoutes);
    
    // Enrollment Routes
    const enrollmentRoutes = require('./routes/enrollment')(db);
    app.use('/api/enroll', enrollmentRoutes);

    app.get('/', (req, res) => {
      res.send('Hello from E-Learning Backend!');
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
  }
}

startServer();
