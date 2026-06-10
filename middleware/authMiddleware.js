import jwt from 'jsonwebtoken';
import 'dotenv/config';

//verifica si el token extiste y es valido
export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado; // Guardamos los datos del usuario en la petición
        next(); // Continuamos a la siguiente función
    } catch (error) {
        res.status(403).json({ error: 'Token inválido' });
    }
};

// Middleware para verificar si es validador
export const esValidador = (req, res, next) => {
    if (req.usuario && req.usuario.es_validador) {
        next(); // Es validador, puede pasar
    } else {
        res.status(403).json({ error: 'Acceso denegado. Requiere rol de validador.' });
    }
};