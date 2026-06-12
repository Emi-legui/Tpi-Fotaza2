import express from 'express';
import Denuncia from '../models/denuncia.js';
import { obtenerDenunciasPendientes, resolverDenuncia } from '../controllers/postController.js';
import { requiereAutenticacion, esValidador } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para crear una nueva denuncia (Requiere estar logueado)
router.post('/', requiereAutenticacion, async (req, res) => {
    try {
        const { id_publicacion, id_comentario, motivo, descripcion } = req.body;
        const id_usuario_denunciante = req.usuario.id;

        if (!id_publicacion && !id_comentario) {
            return res.status(400).json({ error: 'Debes especificar una publicación o comentario para denunciar' });
        }

        const nuevaDenuncia = await Denuncia.create({
            id_publicacion: id_publicacion || null,
            id_comentario: id_comentario || null,
            id_usuario_denunciante,
            motivo,
            descripcion
        });

        res.status(201).json({
            message: 'Denuncia enviada correctamente. Será revisada por nuestro equipo de validadores.',
            denuncia: nuevaDenuncia
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al procesar la denuncia',
            message: error.message
        });
    }
});

// Ruta para obtener denuncias pendientes (Solo validador)
router.get('/pendientes', requiereAutenticacion, esValidador, obtenerDenunciasPendientes);

// Ruta para resolver una denuncia (Solo validador)
router.put('/resolver/:id', requiereAutenticacion, esValidador, resolverDenuncia);

export default router;