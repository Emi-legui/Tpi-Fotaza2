import express from 'express';
import User from '../models/user.js';

const router = express.Router();
// Ruta para crear un nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const newUser = await User.create({ username, email, password });

        res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });

    } catch (error) {
        res.status(400).json({error: 'Error al registrar el usuario', message: error.message });
    }
});

export default router;