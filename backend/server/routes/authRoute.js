import express from 'express';
import { signup, login, refreshToken, logout } from '../controllers/authController/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const authRoute = express.Router();

authRoute.post('/signup', signup);
authRoute.post('/login', login);
authRoute.post('/refresh-token', refreshToken);
authRoute.post('/logout', logout);
authRoute.get('/me', authenticateUser, (req, res) => {
    res.status(200).json({ user: req.user });
});

export default authRoute;