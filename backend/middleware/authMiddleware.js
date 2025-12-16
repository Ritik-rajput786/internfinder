// Import jsonwebtoken to verify JWT tokens
const jwt = require('jsonwebtoken');
// Import User model to check if user exists
const User = require('../models/User');

// Middleware function to protect routes (verify JWT token)
const protect = async (req, res, next) => {
    try {
        let token;

        // Check if Authorization header exists and starts with "Bearer"
        // Token format: "Bearer <token>"
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // Extract token from "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];
        }

        // If no token found, return error
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        try {
            // Verify the token using JWT_SECRET from environment variables
            // This decodes the token and returns the payload (userId)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by ID from token (without password field)
            const user = await User.findById(decoded.userId).select('-password');

            // If user not found, return error
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Attach user information to request object
            // This allows route handlers to access req.user
            req.user = user;

            // Call next() to continue to the next middleware or route handler
            next();

        } catch (error) {
            // If token verification fails, return error
            return res.status(401).json({
                success: false,
                message: 'Not authorized, invalid token'
            });
        }

    } catch (error) {
        // If any other error occurs, return error
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Export the middleware function
module.exports = protect;


