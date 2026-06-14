import express from 'express';
import Comment from '../models/comment.js';
import Post from '../models/post.js';
import Denuncia from '../models/denuncia.js';
import Notificacion from '../models/notificacion.js';
import { requiereAutenticacion } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Crear un comentario (Requiere autenticación)
router.post('/', requiereAutenticacion, async (req, res) => {
    try {
        const { contenido, id_post } = req.body;
        const id_usuario = req.usuario.id;

        // Verificar si la publicacion existe y si tiene los comentarios abiertos
        const post = await Post.findByPk(id_post);
        if (!post) {
            return res.status(404).json({ error: 'Publicacion no encontrada' });
        }

        if (!post.comentarios_abiertos) {
            return res.status(403).json({ error: 'Los comentarios para esta publicacion estan cerrados' });
        }

        const nuevoComentario = await Comment.create({
            contenido,
            id_publicacion: id_post,
            id_usuario
        });

        // Crear notificacipn para el autor de la publicación (si no es el mismo quien comenta)
        if (post.id_autor !== id_usuario) {
            await Notificacion.create({
                tipo_evento: 'comentario',
                id_usuario_destino: post.id_autor,
                id_usuario_origen: id_usuario,
                id_publicacion: id_post
            });
        }

        // Si es AJAX devolvemos JSON, de lo contrario redirigimos al detalle de la foto
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.status(201).json({ message: 'Comentario creado con exito', comment: nuevoComentario });
        } else {
            res.redirect(`/posts/${id_post}`);
        }

    } catch (error) {
        res.status(500).json({ error: 'Error al crear el comentario', message: error.message });
    }
});

// 2. Cerrar comentarios de una publicación (Solo el autor del post)
router.post('/close/:id_post', requiereAutenticacion, async (req, res) => {
    try {
        const { id_post } = req.params;
        const post = await Post.findByPk(id_post);

        if (!post) {
            return res.status(404).json({ error: 'Publicacion no encontrada' });
        }

        if (post.id_autor !== req.usuario.id) {
            return res.status(403).json({ error: 'Solo el autor de la publicacion puede cerrar los comentarios' });
        }

        post.comentarios_abiertos = false;
        await post.save();

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({ message: 'Comentarios cerrados correctamente', post });
        } else {
            res.redirect(`/posts/${id_post}`);
        }

    } catch (error) {
        res.status(500).json({ error: 'Error al cerrar los comentarios', message: error.message });
    }
});

// 3. Denunciar un comentario
router.post('/:id/denunciar', requiereAutenticacion, async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo, descripcion } = req.body;
        const id_usuario_denunciante = req.usuario.id;

        const comentario = await Comment.findByPk(id);
        if (!comentario) {
            return res.status(404).json({ error: 'Comentario no encontrado' });
        }

        // Evitar que el autor del comentario sea quien lo denuncie
        if (comentario.id_usuario === id_usuario_denunciante) {
            return res.status(400).json({ error: 'No puedes denunciar tu propio comentario' });
        }

        const nuevaDenuncia = await Denuncia.create({
            id_comentario: id,
            id_usuario_denunciante,
            motivo,
            descripcion
        });

        res.status(201).json({ 
            message: 'Denuncia de comentario registrada correctamente', 
            denuncia: nuevaDenuncia 
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la denuncia del comentario', message: error.message });
    }
});

// 4. Eliminar un comentario (Solo el autor de la publicación o el autor del comentario)
router.delete('/:id', requiereAutenticacion, async (req, res) => {
    try {
        const { id } = req.params;
        const comentario = await Comment.findByPk(id, {
            include: [{ model: Post }]
        });

        if (!comentario) {
            return res.status(404).json({ error: 'Comentario no encontrado' });
        }

        const id_usuario = req.usuario.id;
        const esAutorComentario = comentario.id_usuario === id_usuario;
        const esAutorPost = comentario.Post && comentario.Post.id_autor === id_usuario;

        if (!esAutorComentario && !esAutorPost) {
            return res.status(403).json({ error: 'No tienes permisos para borrar este comentario' });
        }

        await comentario.destroy();
        res.json({ message: 'Comentario eliminado con exito' });

    } catch (error) {
        res.status(500).json({ error: 'Error al borrar el comentario', message: error.message });
    }
});

export default router;