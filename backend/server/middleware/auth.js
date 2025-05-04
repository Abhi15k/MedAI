import jwt from 'jsonwebtoken';

// Middleware to authenticate user
export const authenticateUser = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Typically includes user ID and role
        next();
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// Middleware to authorize specific roles
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.user || !roles.includes(req.user.user.role)) {
            return res.status(403).json({ message: 'Access Denied. Insufficient permissions.' });
        }
        next();
    };
};
