// Import Express to create router
const express = require('express');
// Import User model to interact with database
const User = require('../models/User');
// Import bcryptjs to hash passwords
const bcrypt = require('bcryptjs');
// Import jsonwebtoken to create authentication tokens
const jwt = require('jsonwebtoken');

// Create router to handle routes
const router = express.Router();

// POST /register - Register a new user
router.post('/register', async (req, res) => {
    try {
        // Get name, email, and password from request body
        const { name, email, password } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash the password before saving to database
        // saltRounds = 10 means how many times to hash (more secure but slower)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user in database with hashed password
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Return success response (don't send password back)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        // If any error occurs, send error response
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// POST /login - Login an existing user
router.post('/login', async (req, res) => {
    try {
        // Get email and password from request body
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email and include password field (needed for comparison)
        // We use .select('+password') because password has select: false in model
        const user = await User.findOne({ email }).select('+password');
        
        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Compare provided password with hashed password in database
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        // If password doesn't match, return error
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // If password matches, create JWT token
        // Token contains user ID, expires in 30 days
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Return success response with token
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        // If any error occurs, send error response
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// Import protect middleware for /me endpoint
const protect = require('../middleware/authMiddleware');

// GET /auth/me - return current authenticated user (token required)
router.get('/me', protect, (req, res) => {
    res.status(200).json({ success: true, data: req.user || null });
});

// Export router to use in server.js
module.exports = router;

