import express from 'express';
import User from '../models/user.js';
import Seguidor from '../models/seguidor.js';
import Notificacion from '../models/notificacion.js';
import { requiereAutenticacion } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            where: { esta_activo: true }
        }); 
        res.render('users', { users }); 
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios', message: error.message });
    }
});

// 2. Seguir a un usuario
router.post('/follow/:id', requiereAutenticacion, async (req, res) => {
    try {
        const id_seguido = parseInt(req.params.id);
        const id_seguidor = req.usuario.id;

        if (id_seguidor === id_seguido) {
            return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
        }

        const usuarioAseguir = await User.findByPk(id_seguido);
        if (!usuarioAseguir || !usuarioAseguir.esta_activo) {
            return res.status(404).json({ error: 'Usuario no encontrado o inactivo' });
        }

        // Crear la relación en la base de datos
        const [relacion, creada] = await Seguidor.findOrCreate({
            where: { id_seguidor, id_seguido }
        });

        if (creada) {
            // Crear notificación de seguimiento
            await Notificacion.create({
                tipo_evento: 'seguimiento',
                id_usuario_destino: id_seguido,
                id_usuario_origen: id_seguidor
            });
            return res.json({ message: `Ahora sigues a ${usuarioAseguir.username}` });
        } else {
            return res.status(400).json({ error: 'Ya sigues a este usuario' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Error al intentar seguir al usuario', message: error.message });
    }
});

// 3. Dejar de seguir a un usuario
router.post('/unfollow/:id', requiereAutenticacion, async (req, res) => {
    try {
        const id_seguido = parseInt(req.params.id);
        const id_seguidor = req.usuario.id;

        const resultado = await Seguidor.destroy({
            where: { id_seguidor, id_seguido }
        });

        if (resultado > 0) {
            res.json({ message: 'Has dejado de seguir al usuario correctamente' });
        } else {
            res.status(400).json({ error: 'No estabas siguiendo a este usuario' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Error al intentar dejar de seguir al usuario', message: error.message });
    }
});

export default router;