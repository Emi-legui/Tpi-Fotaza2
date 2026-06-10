import express from 'express';
import Denuncia from '../models/denuncia.js';
import { obtenerDenunciasPendientes } from '../controllers/postController.js';
import { esValidador, verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para crear una nueva denuncia
router.post('/', async (req, res) => {
    try {
        // Extraemos los datos necesarios del cuerpo de la solicitud (body)
        const { id_publicacion, id_usuario_denunciante, motivo } = req.body;

        // Creamos la denuncia en la base de datos
        const nuevaDenuncia = await Denuncia.create({
            id_publicacion,
            id_usuario_denunciante,
            motivo
        });

        res.status(201).json({
            message: 'Denuncia enviada correctamente. Sera revisada por nuestro equipo.',
            denuncia: nuevaDenuncia
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al procesar la denuncia',
            message: error.message
        });
    }
});
//Ruta para obtener denuncias pendientes
router.get('/pendientes', verificarToken, esValidador , obtenerDenunciasPendientes);

// Ruta para resolver una denuncia
router.put('/resolver/:id', verificarToken, esValidador, resolverDenuncia);

export default router;