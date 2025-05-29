import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
    try {
        // Extract token from cookies or Authorization header
        let token;
        if (req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'Authentication required',
                code: 'NO_TOKEN_PROVIDED'
            });
        }

        // Check if token is blacklisted
        const isBlackListed = await redisClient.get(token);
        if (isBlackListed) {
            res.clearCookie('token');
            return res.status(401).json({ 
                success: false,
                error: 'Session expired. Please login again.',
                code: 'TOKEN_BLACKLISTED'
            });
        }

        // Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (verifyError) {
            // Handle specific JWT errors differently
            if (verifyError instanceof jwt.TokenExpiredError) {
                return res.status(401).json({
                    success: false,
                    error: 'Session expired. Please login again.',
                    code: 'TOKEN_EXPIRED',
                    // Optionally include refresh token URL if your API supports it
                    refresh_url: '/api/auth/refresh'
                });
            }

            if (verifyError instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid authentication token',
                    code: 'INVALID_TOKEN'
                });
            }

            // For other unexpected JWT errors
            throw verifyError;
        }

    } catch (error) {
        console.error('Authentication error:', error);
            
            // For unexpected errors
        return res.status(500).json({
            success: false,
            error: 'Internal authentication error',
            code: 'AUTH_INTERNAL_ERROR'
        });
    }
};