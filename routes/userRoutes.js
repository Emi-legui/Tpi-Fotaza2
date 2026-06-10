import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Ruta para crear un nuevo usuario (Ruta Post para registro)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({ 
            username,
             email,
             password: hashedPassword 
        });

        res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });

    } catch (error) {
        res.status(400).json({error: 'Error al registrar el usuario', message: error.message });
    }
});
//Ruta Get para obtener todos los usuarios
//Nos ayuda para poder ver la lista completa
router.get('/', async (req, res) => {
    try{
        //Busca todos los usuarios en la base de datos
        const users = await User.findAll(); 
        // Renderiza la vista 'users' y le pasa la lista de usuarios
        res.render('users', { users }); 

    } catch (error) {
        res.status(500).json({error: 'Error al obtener los usuarios', message: error.message });
    }
});

export default router;