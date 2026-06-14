import express from 'express';
import Valoracion from '../models/valoracion.js';
import Post from '../models/post.js';
import Notificacion from '../models/notificacion.js';
import { requiereAutenticacion } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Calificar una publicación (1 a 5 estrellas)
router.post('/', requiereAutenticacion, async (req, res) => {
    try {
        const { id_publicacion, calificacion } = req.body;
        const id_usuario = req.usuario.id;

        const calif = parseInt(calificacion);
        if (isNaN(calif) || calif < 1 || calif > 5) {
            return res.status(400).json({ error: 'La calificacion debe ser un numero entero entre 1 y 5' });
        }

        const post = await Post.findByPk(id_publicacion);
        if (!post) {
            return res.status(404).json({ error: 'Publicacion no encontrada' });
        }

        // El autor no puede valorar su propia publicación
        if (post.id_autor === id_usuario) {
            return res.status(400).json({ error: 'No puedes calificar tus propias publicaciones' });
        }

        // Buscar si ya valoró para hacer un update o crear
        const [valoracion, creada] = await Valoracion.findOrCreate({
            where: { id_usuario, id_publicacion },
            defaults: { calificacion: calif }
        });

        if (!creada) {
            // Si ya existe, actualizamos la calificación
            valoracion.calificacion = calif;
            await valoracion.save();
        }

        // Crear notificación para el autor
        await Notificacion.findOrCreate({
            where: {
                tipo_evento: 'valoracion',
                id_usuario_destino: post.id_autor,
                id_usuario_origen: id_usuario,
                id_publicacion: id_publicacion
            }
        });

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({ message: 'Calificacion guardada con exito', valoracion });
        } else {
            res.redirect(`/posts/${id_publicacion}`);
        }

    } catch (error) {
        res.status(500).json({ error: 'Error al calificar la publicacion', message: error.message });
    }
});

export default router;
