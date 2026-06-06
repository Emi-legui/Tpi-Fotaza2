import express from 'express';
import Comment from '../models/comment.js';

const router = express.Router();
router.post('/', async (req, res) => {
    try{
        const {contenido, id_post, id_autor} = req.body;

        const nuevoComentario = await Comment.create({
            contenido,
            id_usuario,
            id_publicacion
        });
        res.status(201).json({
            message: 'Comentario creado con exito',
            comment: nuevoComentario
        });
    }catch(error){
        res.status(500).json({
            error: 'Error al crear el comentario',
            message: error.message
        });
    }
});
//Listar todos los comentarios de una publicacion
router.get('/post/:id_publicacion', async (req, res) => {
    try{
        const {id_publicacion} = req.params;
        const comentarios = await Comment.findAll({
            where: {id_publicacion}
        });
        res.status(200).json(comentarios);
    }catch(error){
        res.status(500).json({
            error: 'Error al obtener los comentarios',
            message: error.message
        });
    }
});
export default router;