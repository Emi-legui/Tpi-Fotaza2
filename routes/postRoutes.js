import express from 'express';
import { Op } from 'sequelize';
import Post from '../models/post.js';
import Tag from '../models/tag.js';
import User from '../models/user.js';
import Valoracion from '../models/valoracion.js';
import Comment from '../models/comment.js';
import { verificarEstadoPublicacion } from '../controllers/postController.js';
import { requiereAutenticacion } from '../middleware/authMiddleware.js';
import upload from '../utils/upload.js';
import { aplicarMarcaDeAgua } from '../utils/watermark.js';

const router = express.Router();

// 1. Crear una publicacion (Formulario Multipart)
router.post('/create', requiereAutenticacion, upload.single('imagen'), async (req, res) => {
    try {
        const { titulo, descripcion, licencia, marca_agua_texto, etiquetas } = req.body;
        const id_autor = req.usuario.id;

        if (!req.file) {
            return res.status(400).render('create-post', { error: 'Debes subir una imagen para publicar.' });
        }

        // Ruta de acceso estática
        const imagenRuta = `/uploads/${req.file.filename}`;
        const absoluteImagePath = req.file.path;

        // Aplicar marca de agua si es Copyright y tiene texto
        if (licencia === 'copyright' && marca_agua_texto) {
            try {
                await aplicarMarcaDeAgua(absoluteImagePath, marca_agua_texto);
            } catch (err) {
                console.error('Error al estampar marca de agua:', err);
                return res.status(500).render('create-post', { error: 'Error al procesar la imagen con marca de agua.' });
            }
        }

        // Guardar publicación en base de datos
        const nuevoPost = await Post.create({
            titulo,
            descripcion: descripcion || '',
            imagen: imagenRuta,
            licencia: licencia || 'libre',
            marca_agua_texto: licencia === 'copyright' ? marca_agua_texto : null,
            id_autor
        });

        // Guardar y asociar etiquetas
        if (etiquetas) {
            const tagsArray = etiquetas
                .split(',')
                .map(t => t.trim().toLowerCase())
                .filter(t => t.length > 0);

            for (const tagNombre of tagsArray) {
                const [tagObj] = await Tag.findOrCreate({
                    where: { nombre: tagNombre }
                });
                await nuevoPost.addTag(tagObj);
            }
        }

        res.redirect('/posts');

    } catch (error) {
        console.error('Error al crear publicacion:', error);
        res.status(500).render('create-post', { error: 'Error interno del servidor', message: error.message });
    }
});

// 2. Obtener lista de publicaciones (JSON - con filtros de busqueda)
router.get('/buscar', async (req, res) => {
    try {
        const { q, tag, licencia, rating } = req.query;
        let whereClause = {};

        // Filtro por busqueda general (titulo o descripcion)
        if (q) {
            whereClause[Op.or] = [
                { titulo: { [Op.iLike]: `%${q}%` } },
                { descripcion: { [Op.iLike]: `%${q}%` } }
            ];
        }

        // Filtro por tipo de licencia
        if (licencia && (licencia === 'copyright' || licencia === 'libre')) {
            whereClause.licencia = licencia;
        }

        // Estructura de inclusión para relacionar modelos
        let includeClause = [
            {
                model: User,
                attributes: ['id', 'username']
            },
            {
                model: Tag,
                attributes: ['id', 'nombre'],
                through: { attributes: [] } // Oculta tabla pivote
            },
            {
                model: Valoracion,
                attributes: ['calificacion']
            }
        ];

        // Filtro por etiqueta
        if (tag) {
            includeClause[1].where = { nombre: tag.trim().toLowerCase() };
        }

        // Buscar publicaciones con relaciones
        let publicaciones = await Post.findAll({
            where: whereClause,
            include: includeClause,
            order: [['fecha_creacion', 'DESC']]
        });

        // Calcular promedio de valoraciones y filtrar por rating si corresponde
        publicaciones = publicaciones.map(post => {
            const postJson = post.toJSON();
            const valoraciones = postJson.Valoracions || [];
            const cant = valoraciones.length;
            const prom = cant > 0 ? (valoraciones.reduce((acc, v) => acc + v.calificacion, 0) / cant).toFixed(1) : 0;
            
            postJson.promedioValoracion = parseFloat(prom);
            postJson.cantidadValoraciones = cant;
            return postJson;
        });

        if (rating) {
            const minRating = parseFloat(rating);
            publicaciones = publicaciones.filter(post => post.promedioValoracion >= minRating);
        }

        res.json(publicaciones);

    } catch (error) {
        res.status(500).json({ error: 'Error al filtrar las publicaciones', message: error.message });
    }
});

// 3. Editar una publicacion
router.put('/:id', requiereAutenticacion, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion } = req.body;

        const post = await Post.findByPk(id);
        if (!post) {
            return res.status(404).json({ error: 'Publicacion no encontrada' });
        }

        // Verificar autoria
        if (post.id_autor !== req.usuario.id) {
            return res.status(403).json({ error: 'No tienes permisos para editar esta publicacion' });
        }

        // Verificar estado de bloqueo por denuncias
        const estaBloqueado = await verificarEstadoPublicacion(id);
        if (estaBloqueado) {
            return res.status(403).json({ 
                error: 'No se puede editar', 
                message: 'La publicacion tiene denuncias acumuladas y esta bloqueada para revision' 
            });
        }

        post.titulo = titulo;
        post.descripcion = descripcion;
        await post.save();

        res.json({ message: 'Publicacion actualizada con exito', post });

    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la publicacion', message: error.message });
    }
});

// 4. Eliminar una publicacion
router.delete('/:id', requiereAutenticacion, async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findByPk(id);
        if (!post) {
            return res.status(404).json({ error: 'Publicacion no encontrada' });
        }

        // Verificar autoria o si es moderador (validador)
        if (post.id_autor !== req.usuario.id && !req.usuario.es_validador) {
            return res.status(403).json({ error: 'No tienes permisos para eliminar esta publicacion' });
        }

        await post.destroy();
        res.json({ message: 'Publicacion eliminada con exito' });

    } catch (error) {
        res.status(500).json({ error: 'Error al borrar la publicacion', message: error.message });
    }
});

export default router;