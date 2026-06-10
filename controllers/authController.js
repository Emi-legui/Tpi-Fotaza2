import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const SECRET_KEY = process.env.JWT_SECRET;

//Funcion de registro
export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        await User.create({username, email, password   });

        //tras un registro exitoso, lo mandamos directo al login para que entre
        res.redirect('/api/auth/login');

    } catch (error) {
        res.status(400).render('register', { error: 'Error al registrar el usuario', message: error.message });
    }
}

//Funcion de login
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // 1. Buscamos al usuario por su email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).render('login', { error: 'Credenciales invalidas' });
        }

        // 2. Comparamos la contraseña enviada con la guardada (ya cifrada)
        const passwordValida = await bcrypt.compare(password, user.password);
        if (!passwordValida) {
            return res.status(401).render('login', { error: 'Credenciales invalidas' });
        }

        // 3. Si todo es correcto, generamos un Token
        const token = jwt.sign(
            { id: user.id, es_validador: user.es_validador }, 
            SECRET_KEY, 
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        //4. Guardamos el token en una cookie segura
        res.cookie('token',token, {
            httpOnly: true, //evita que el token sea accesible dede js
            secure: process.env.NODE_ENV === 'production', // Solo se envía en HTTPS en producción
            maxAge: 3600000 // El token expira en 1 hora (en milisegundos)
        });
        //5. Redireccionamos al feed de publicaciones
        res.redirect('/posts');
        
    } catch (error) {
        res.status(500).render('login', { error: 'Error al iniciar sesion', message: error.message });
    }
}