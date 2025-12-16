// Import mongoose library for MongoDB connection
const mongoose = require('mongoose');

// Function to connect to MongoDB database
const connectDB = async () => {
    try {
        // Connect to MongoDB using the connection string from environment variables
        // MONGO_URI is stored in .env file for security
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internfinder';
        const conn = await mongoose.connect(mongoUri);

        // If connection is successful, display this message
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // If connection fails, display the error message
        console.error(`Error: ${error.message}`);
        // Exit the process if database connection fails
        process.exit(1);
    }
};

// Export the function so it can be used in other files
module.exports = connectDB;


