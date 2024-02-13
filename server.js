const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Load environment variables
require('dotenv').config();

const mongodbUri = process.env.MONGODB_URI;
const fastwayApiKey = process.env.FASTWAY_API_KEY;

// Connect to MongoDB
mongoose.connect(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a mongoose model for the user data
const User = mongoose.model('User', {
    userid: String,
    labelNo: String,
});

app.get('/', async (req, res) => {
    try {
        // Get the userid from the request parameters
        const userid = req.params.userid;

        // Find the user in the MongoDB database
        const user = await User.findOne({ userid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Use the labelNo from the user document
        const labelNo = user.labelNo;

        // Make an API call to the Fastway API
        const response = await axios.get(`https://sa.api.fastway.org/v3/tracktrace/pod/${labelNo}`, {
            headers: {
                'api_key': fastwayApiKey,
            },
        });

        // Extract the data from the API response
        const data = response.data;

        // Sending the API response as JSON
        res.json(data);
    } catch (error) {
        console.error('Error making API call:', error.message);
        // Sending an error response if the API call fails
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is listening to http://localhost:${port}`);
});
