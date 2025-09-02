const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
// Make sure to set the PORT in your Render environment variables as well
const PORT = process.env.PORT || 5000; 

const uri = process.env.MONGO_URI;

const clientOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
};

const client = new MongoClient(uri, clientOptions);
const dbName = 'elearning';

const frontendURL = process.env.FRONTEND_URL; 

const corsOptions = {
  origin: frontendURL
};

app.use(cors(corsOptions));


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
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
  }
}

startServer();
