// Import mongoose to create schema and model
const mongoose = require('mongoose');

// Define the User schema (structure of user data in database)
const userSchema = new mongoose.Schema({
    // User's full name - required field
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true // Removes extra spaces from beginning and end
    },
    // User's email - required, unique, and must be valid email format
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true, // No two users can have same email
        lowercase: true, // Converts email to lowercase
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    // User's password - required and will be hashed before saving
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6, // Minimum 6 characters
        select: false // Don't include password by default when querying (for security)
    }
}, {
    // Automatically add createdAt and updatedAt fields
    timestamps: true
});

// Create and export the User model
// This model will be used to interact with the 'users' collection in MongoDB
module.exports = mongoose.model('User', userSchema);

