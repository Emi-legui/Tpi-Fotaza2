import jwt from 'jsonwebtoken';
import 'dotenv/config';

const SECRET_KEY = process.env.JWT_SECRET;

// Middleware para rutas que requieren estar logueado
export const requiereAutenticacion = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const datosDecodificados = jwt.verify(token, SECRET_KEY);
        req.usuario = datosDecodificados;
        res.locals.usuario = datosDecodificados; // Hace al usuario disponible en las vistas de Pug
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// Middleware para rutas exclusivas del validador de contenidos
export const esValidador = (req, res, next) => {
    if (!req.usuario || !req.usuario.es_validador) {
        return res.status(403).render('error', { 
            message: 'Acceso denegado. Se requiere perfil de Validador de contenidos.' 
        });
    }
    next();
};

// Middleware opcional para vistas publicas que cambian segun si estas logueado o no
export const opcionalAutenticacion = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const datosDecodificados = jwt.verify(token, SECRET_KEY);
            req.usuario = datosDecodificados;
            res.locals.usuario = datosDecodificados;
        } catch (error) {
            res.clearCookie('token');
        }
    }
    next();
};