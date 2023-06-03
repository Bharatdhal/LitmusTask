const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const mongodb = require('mongodb');

const app = express();
const upload = multer({ dest: 'uploads/' });

// MongoDB connection details
const mongoURI =
  'mongodb+srv://BharatAdmin:BharatAdmin@bharat.d3nfj1t.mongodb.net/';
const dbName = 'csvDB';
const collectionName = 'csvData';

// Function to establish a connection with MongoDB
async function connectToMongoDB() {
  try {
    const client = await mongodb.MongoClient.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return collection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Define the route to handle file upload
app.post('/upload', upload.single('csvFile'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const collection = await connectToMongoDB();

  // Read and process the uploaded CSV file
  const results = [];
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', () => {
      // Insert the CSV data into MongoDB
      collection.insertMany(results, (err, result) => {
        if (err) {
          return res.status(500).send('Error inserting data into MongoDB.');
        }
      });
      return res.status(200).send('Data uploaded successfully.');
    });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
