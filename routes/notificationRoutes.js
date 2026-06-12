import express from 'express';
import Notificacion from '../models/notificacion.js';
import User from '../models/user.js';
import Post from '../models/post.js';
import { requiereAutenticacion } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Obtener todas las notificaciones del usuario logueado (JSON)
router.get('/', requiereAutenticacion, async (req, res) => {
    try {
        const notificaciones = await Notificacion.findAll({
            where: { id_usuario_destino: req.usuario.id },
            include: [
                {
                    model: User,
                    as: 'UsuarioOrigen',
                    attributes: ['id', 'username']
                },
                {
                    model: Post,
                    attributes: ['id', 'titulo']
                }
            ],
            order: [['fecha', 'DESC']]
        });
        res.json(notificaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las notificaciones', message: error.message });
    }
});

// 2. Marcar una notificación como leída
router.post('/:id/read', requiereAutenticacion, async (req, res) => {
    try {
        const { id } = req.params;
        const notif = await Notificacion.findOne({
            where: { id, id_usuario_destino: req.usuario.id }
        });

        if (!notif) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }

        notif.leida = true;
        await notif.save();

        res.json({ message: 'Notificación marcada como leída', notificacion: notif });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la notificación', message: error.message });
    }
});

// 3. Marcar TODAS las notificaciones como leídas
router.post('/read-all', requiereAutenticacion, async (req, res) => {
    try {
        await Notificacion.update(
            { leida: true },
            { where: { id_usuario_destino: req.usuario.id, leida: false } }
        );
        res.json({ message: 'Todas las notificaciones han sido marcadas como leídas' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar notificaciones', message: error.message });
    }
});

export default router;
