import express from 'express';
import User from '../models/user.js';


const router = express.Router();

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