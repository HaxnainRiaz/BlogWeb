import express from 'express';
import { signup, login, logout } from '../controllers/authController.js';

const router = express.Router();

// Auth routes (no /me endpoint as requested)
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

export default router;

