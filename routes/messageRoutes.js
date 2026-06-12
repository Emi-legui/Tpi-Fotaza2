import express from 'express';
import { Op } from 'sequelize';
import Mensaje from '../models/mensaje.js';
import User from '../models/user.js';
import Post from '../models/post.js';
import Notificacion from '../models/notificacion.js';
import { requiereAutenticacion } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Iniciar interés ("Me interesa") y crear la primera interacción
router.post('/interest/:id_post', requiereAutenticacion, async (req, res) => {
    try {
        const id_post = parseInt(req.params.id_post);
        const id_comprador = req.usuario.id;

        // Buscar el post y su autor
        const post = await Post.findByPk(id_post);
        if (!post) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        if (post.id_autor === id_comprador) {
            return res.status(400).json({ error: 'No puedes marcar "Me interesa" en tu propia publicación' });
        }

        // Crear la notificación para el autor
        await Notificacion.create({
            tipo_evento: 'interes',
            id_usuario_destino: post.id_autor,
            id_usuario_origen: id_comprador,
            id_publicacion: id_post
        });

        // Crear un mensaje automático para iniciar la conversación
        const mensajeAuto = await Mensaje.create({
            contenido: `Hola, estoy interesado en adquirir tu fotografía "${post.titulo}". ¿Podemos ponernos en contacto?`,
            id_remitente: id_comprador,
            id_destinatario: post.id_autor,
            id_publicacion: id_post
        });

        // Si es AJAX devolvemos JSON, si no redirigimos al chat
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({ message: 'Interés registrado e inicio de chat creado', chatUrl: `/messages/${post.id_autor}/${id_post}` });
        } else {
            res.redirect(`/messages/${post.id_autor}/${id_post}`);
        }

    } catch (error) {
        res.status(500).json({ error: 'Error al registrar interés', message: error.message });
    }
});

// 2. Enviar un mensaje nuevo
router.post('/send', requiereAutenticacion, async (req, res) => {
    try {
        const { id_destinatario, id_publicacion, contenido } = req.body;
        const id_remitente = req.usuario.id;

        if (!contenido || contenido.trim().length === 0) {
            return res.status(400).json({ error: 'El contenido del mensaje no puede estar vacío' });
        }

        const mensaje = await Mensaje.create({
            contenido: contenido.trim(),
            id_remitente,
            id_destinatario,
            id_publicacion: id_publicacion || null
        });

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.status(201).json({ message: 'Mensaje enviado', mensaje });
        } else {
            res.redirect(`/messages/${id_destinatario}/${id_publicacion}`);
        }

    } catch (error) {
        res.status(500).json({ error: 'Error al enviar el mensaje', message: error.message });
    }
});

// 3. Obtener chats activos (JSON)
router.get('/inbox', requiereAutenticacion, async (req, res) => {
    try {
        const userId = req.usuario.id;

        // Buscar todos los mensajes donde el usuario participa
        const mensajes = await Mensaje.findAll({
            where: {
                [Op.or]: [
                    { id_remitente: userId },
                    { id_destinatario: userId }
                ]
            },
            include: [
                { model: User, as: 'Remitente', attributes: ['id', 'username'] },
                { model: User, as: 'Destinatario', attributes: ['id', 'username'] },
                { model: Post, attributes: ['id', 'titulo', 'imagen'] }
            ],
            order: [['fecha_envio', 'DESC']]
        });

        // Agrupar mensajes para simular conversaciones activas (por usuario del chat y publicación)
        const conversaciones = [];
        const vistas = new Set();

        for (const msg of mensajes) {
            const otroUsuario = msg.id_remitente === userId ? msg.Destinatario : msg.Remitente;
            const post = msg.Post;
            if (!otroUsuario || !post) continue;

            const key = `${otroUsuario.id}-${post.id}`;
            if (!vistas.has(key)) {
                vistas.add(key);
                conversaciones.push({
                    otroUsuario,
                    post,
                    ultimoMensaje: msg.contenido,
                    fecha: msg.fecha_envio
                });
            }
        }

        res.json(conversaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener bandeja de entrada', message: error.message });
    }
});

export default router;
