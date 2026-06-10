import jwt from 'jsonwebtoken';
import 'dotenv/config';

const SECRET_KEY = process.env.JWT_SECRET;

//verifica si el token extiste y es valido
export const requiereAutenticacion = (req, res, next) => {

// Intentamos leer la cookie del token que guardamos en el login
    const token = req.cookies.token;

    // Si no existe la cookie, lo mandamos derecho al login
    if (!token) {
        return res.redirect('/auth/login');
    }

    try {
        //  Verificamos si el token es valido y no expiro
        const datosDecodificados = jwt.verify(token, SECRET_KEY);
        
        // Inyectamos los datos del usuario dentro del pedido ('req') para que los controladores los usen
        req.usuario = datosDecodificados; 
        
        // Todo OK, dejamos que continúe a la ruta que quería entrar
        next();
    } catch (error) {
        // Si el token es invalido o expiro, limpiamos la cookie y al login
        res.clearCookie('token');
        return res.redirect('/auth/login');
    }
    };