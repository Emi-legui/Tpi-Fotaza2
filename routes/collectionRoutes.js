import express from 'express';
import Coleccion from '../models/coleccion.js';
import ColeccionPost from '../models/coleccionPost.js';
import Post from '../models/post.js';
import { requiereAutenticacion } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Obtener colecciones del usuario (incluyendo posts)
router.get('/', requiereAutenticacion, async (req, res) => {
    try {
        const colecciones = await Coleccion.findAll({
            where: { id_usuario: req.usuario.id },
            include: [{
                model: Post,
                through: { attributes: [] }
            }]
        });
        res.json(colecciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener colecciones', message: error.message });
    }
});

// 2. Crear una nueva colección
router.post('/', requiereAutenticacion, async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre || nombre.trim().length === 0) {
            return res.status(400).json({ error: 'El nombre de la coleccion es requerido' });
        }

        // Buscar o crear la colección para evitar duplicados del mismo usuario
        const [coleccion, creada] = await Coleccion.findOrCreate({
            where: { 
                nombre: nombre.trim(), 
                id_usuario: req.usuario.id 
            }
        });

        if (!creada) {
            return res.status(400).json({ error: 'Ya tienes una coleccion con ese nombre' });
        }

        res.status(201).json({ message: 'Coleccion creada con exito', coleccion });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear colección', message: error.message });
    }
});

// 3. Añadir publicación a una colección (o favoritos)
router.post('/add', requiereAutenticacion, async (req, res) => {
    try {
        const { id_coleccion, id_post } = req.body;

        // Verificar pertenencia de la colección al usuario
        const coleccion = await Coleccion.findOne({
            where: { id: id_coleccion, id_usuario: req.usuario.id }
        });

        if (!coleccion) {
            return res.status(404).json({ error: 'Coleccion no encontrada' });
        }

        // Verificar existencia del post
        const post = await Post.findByPk(id_post);
        if (!post) {
            return res.status(404).json({ error: 'Publicacion no encontrada' });
        }

        // Asociar (Sequelize previene duplicados si usamos findOrCreate o captura la restricción de base de datos)
        const [asociacion, creada] = await ColeccionPost.findOrCreate({
            where: { 
                id_coleccion, 
                id_publicacion: id_post 
            }
        });

        if (!creada) {
            return res.status(400).json({ error: 'La publicacion ya se encuentra en esta coleccion' });
        }

        res.json({ message: 'Publicacion agregada a la coleccion correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al añadir a la colección', message: error.message });
    }
});

// 4. Quitar publicación de una colección
router.post('/remove', requiereAutenticacion, async (req, res) => {
    try {
        const { id_coleccion, id_post } = req.body;

        const coleccion = await Coleccion.findOne({
            where: { id: id_coleccion, id_usuario: req.usuario.id }
        });

        if (!coleccion) {
            return res.status(404).json({ error: 'Coleccion no encontrada' });
        }

        await ColeccionPost.destroy({
            where: { 
                id_coleccion, 
                id_publicacion: id_post 
            }
        });

        res.json({ message: 'Publicacion eliminada de la coleccion correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al remover de la colección', message: error.message });
    }
});

// 5. Alternar Favoritos (Ruta rápida)
router.post('/toggle-favorite/:id_post', requiereAutenticacion, async (req, res) => {
    try {
        const id_post = parseInt(req.params.id_post);
        
        // 1. Buscar o crear la colección por defecto "Favoritos"
        const [favColec] = await Coleccion.findOrCreate({
            where: { 
                nombre: 'Favoritos', 
                id_usuario: req.usuario.id 
            }
        });

        // 2. Verificar si ya es favorito
        const favExistente = await ColeccionPost.findOne({
            where: { 
                id_coleccion: favColec.id, 
                id_publicacion: id_post 
            }
        });

        if (favExistente) {
            // Quitar de favoritos
            await favExistente.destroy();
            return res.json({ message: 'Publicacion quitada de favoritos', favorited: false });
        } else {
            // Añadir a favoritos
            await ColeccionPost.create({
                id_coleccion: favColec.id,
                id_publicacion: id_post
            });
            return res.json({ message: 'Publicacion guardada en favoritos', favorited: true });
        }

    } catch (error) {
        res.status(500).json({ error: 'Error al alternar favorito', message: error.message });
    }
});

export default router;
