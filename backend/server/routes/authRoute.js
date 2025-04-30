import express from 'express';
import { signup, login } from '../controllers/authController/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const authRoute = express.Router();

authRoute.post('/signup', signup);
authRoute.post('/login', login);
authRoute.get('/me', authenticateUser, (req, res) => {
    res.status(200).json({ user: req.user });
});

export default authRoute;