import express from 'express';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

//rutas para mostrar los formularios (GET)

//Muestra el formulario de login
router.get('/login', (req, res) => {
    res.render('login');
});
//Muestra el formulario de registro
router.get('/register', (req, res) => {
    res.render('register');
});

//Rutas para porcesar los formularios (POST)

// Procesa los datos del login
router.post('/login', login);
// Procesa los datos del registro
router.post('/register', register);

export default router;