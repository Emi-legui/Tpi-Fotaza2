import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();

// Ruta para iniciar sesion
router.post('/login', login);
// Ruta para registrar un nuevo usuario 
router.post('/register', register);

export default router;