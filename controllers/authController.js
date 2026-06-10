import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const SECRET_KEY = process.env.JWT_SECRET;
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // 1. Buscamos al usuario por su email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }

        // 2. Comparamos la contraseña enviada con la guardada (ya cifrada)
        const passwordValida = await bcrypt.compare(password, user.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }

        // 3. Si todo es correcto, generamos un Token
        const token = jwt.sign(
            { id: user.id, es_validaor: user.es_validaor }, 
            SECRET_KEY, 
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        res.json({
            message: 'Inicio de sesion exitoso',
            token: token
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesion', message: error.message });
    }
}