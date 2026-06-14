import express from 'express';
import { Op } from 'sequelize';
import User from '../models/user.js';
import Post from '../models/post.js';
import Tag from '../models/tag.js';
import Comment from '../models/comment.js';
import Valoracion from '../models/valoracion.js';
import Denuncia from '../models/denuncia.js';
import Seguidor from '../models/seguidor.js';
import Notificacion from '../models/notificacion.js';
import Coleccion from '../models/coleccion.js';
import ColeccionPost from '../models/coleccionPost.js';
import Mensaje from '../models/mensaje.js';
import { requiereAutenticacion, opcionalAutenticacion, esValidador } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Root: Redirige al Feed
router.get('/', (req, res) => {
    res.redirect('/posts');
});

// 2. Login y Registro (Vistas)
router.get('/login', opcionalAutenticacion, (req, res) => {
    if (req.usuario) {
        return res.redirect('/posts');
    }
    res.render('login');
});

router.get('/register', opcionalAutenticacion, (req, res) => {
    if (req.usuario) {
        return res.redirect('/posts');
    }
    res.render('register');
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

// 3. Feed de Publicaciones (Home)
router.get('/posts', opcionalAutenticacion, async (req, res) => {
    try {
        const { q, tag, licencia, rating, following } = req.query;
        let whereClause = {};

        // Regra de contenido público para anónimos
        if (!req.usuario) {
            whereClause.licencia = 'libre'; // Anónimos solo ven fotos libres de copyright
        } else if (licencia && (licencia === 'copyright' || licencia === 'libre')) {
            whereClause.licencia = licencia;
        }

        // Filtro por búsqueda de texto
        if (q) {
            whereClause[Op.or] = [
                { titulo: { [Op.iLike]: `%${q}%` } },
                { descripcion: { [Op.iLike]: `%${q}%` } }
            ];
        }

        // Filtro de seguidos (solo si está logueado)
        if (following === 'true' && req.usuario) {
            const seguidos = await Seguidor.findAll({
                where: { id_seguidor: req.usuario.id },
                attributes: ['id_seguido']
            });
            const seguidosIds = seguidos.map(s => s.id_seguido);
            whereClause.id_autor = { [Op.in]: seguidosIds };
        }

        const includeClause = [
            { model: User, attributes: ['id', 'username', 'esta_activo'] },
            { model: Tag, attributes: ['id', 'nombre'], through: { attributes: [] } },
            { model: Valoracion, attributes: ['calificacion'] }
        ];

        if (tag) {
            includeClause[1].where = { nombre: tag.trim().toLowerCase() };
        }

        // Obtener publicaciones (solo de autores activos)
        let posts = await Post.findAll({
            where: whereClause,
            include: includeClause,
            order: [['fecha_creacion', 'DESC']]
        });

        // Filtrar posts cuyos autores estén activos
        posts = posts.filter(post => post.User && post.User.esta_activo);

        // Procesar valoraciones y promedios
        posts = posts.map(post => {
            const pJson = post.toJSON();
            const valoraciones = pJson.Valoracions || [];
            const cant = valoraciones.length;
            const prom = cant > 0 ? (valoraciones.reduce((acc, v) => acc + v.calificacion, 0) / cant).toFixed(1) : 0;
            
            pJson.promedioValoracion = parseFloat(prom);
            pJson.cantidadValoraciones = cant;
            return pJson;
        });

        // Filtro de calificación mínima promedio
        if (rating) {
            const minRating = parseFloat(rating);
            posts = posts.filter(post => post.promedioValoracion >= minRating);
        }

        // --- ALGORITMO DE BALANCE DE HOME ---
        // Definición de reglas:
        // - "Bien valoradas y considerable cantidad de votos": Promedio >= 4.0 y Votos >= 2
        // - "Criterio de balance": Mezclar preferentemente estas destacadas con las demás de forma intercalada (70% destacadas, 30% otras)
        const destacadas = posts.filter(p => p.promedioValoracion >= 4.0 && p.cantidadValoraciones >= 2);
        const comunes = posts.filter(p => p.promedioValoracion < 4.0 || p.cantidadValoraciones < 2);

        // Mezclar ambos grupos aleatoriamente para dinamismo
        destacadas.sort(() => Math.random() - 0.5);
        comunes.sort(() => Math.random() - 0.5);

        const postsBalanceados = [];
        let iDest = 0, iCom = 0;

        // Bucle para balancear 2 destacadas y 1 común sucesivamente
        while (iDest < destacadas.length || iCom < comunes.length) {
            if (iDest < destacadas.length) {
                postsBalanceados.push(destacadas[iDest++]);
            }
            if (iDest < destacadas.length) {
                postsBalanceados.push(destacadas[iDest++]);
            }
            if (iCom < comunes.length) {
                postsBalanceados.push(comunes[iCom++]);
            }
        }

        // Obtener todas las etiquetas existentes para mostrarlas en los filtros rápidos
        const allTags = await Tag.findAll({ limit: 15 });

        res.render('feed', {
            posts: postsBalanceados.filter(Boolean), // Elimina posibles nulos
            tags: allTags,
            query: req.query
        });

    } catch (error) {
        console.error('Error al renderizar feed:', error);
        res.status(500).render('error', { message: 'Error al obtener publicaciones' });
    }
});

// 4. Crear Publicación (Formulario Vista)
router.get('/posts/create', requiereAutenticacion, (req, res) => {
    res.render('create-post');
});

// 5. Detalle de una Publicación
router.get('/posts/:id', opcionalAutenticacion, async (req, res) => {
    try {
        const id_post = parseInt(req.params.id);
        const post = await Post.findByPk(id_post, {
            include: [
                { model: User, attributes: ['id', 'username', 'esta_activo'] },
                { model: Tag, attributes: ['id', 'nombre'], through: { attributes: [] } },
                { 
                    model: Comment, 
                    include: [{ model: User, attributes: ['id', 'username'] }]
                },
                { model: Valoracion }
            ]
        });

        if (!post || !post.User.esta_activo) {
            return res.status(404).render('error', { message: 'La publicacion no existe o el autor ha sido desactivado' });
        }

        const postJson = post.toJSON();

        // Ordenar comentarios por fecha de creación de forma segura
        if (postJson.Comments) {
            postJson.Comments.sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion));
        }

        // Calcular promedio y cantidad de votos
        const valoraciones = postJson.Valoracions || [];
        const cant = valoraciones.length;
        const prom = cant > 0 ? (valoraciones.reduce((acc, v) => acc + v.calificacion, 0) / cant).toFixed(1) : 0;
        postJson.promedioValoracion = parseFloat(prom);
        postJson.cantidadValoraciones = cant;

        // Verificar si el usuario logueado ya votó y cuál fue su calificación
        let miValoracion = 0;
        let esFavorito = false;
        if (req.usuario) {
            const vUsuario = valoraciones.find(v => v.id_usuario === req.usuario.id);
            if (vUsuario) miValoracion = vUsuario.calificacion;

            // Verificar si está en sus Favoritos
            const favColec = await Coleccion.findOne({
                where: { nombre: 'Favoritos', id_usuario: req.usuario.id }
            });
            if (favColec) {
                const favPost = await ColeccionPost.findOne({
                    where: { id_coleccion: favColec.id, id_publicacion: id_post }
                });
                esFavorito = !!favPost;
            }
        }

        res.render('post-detail', {
            post: postJson,
            miValoracion,
            esFavorito
        });

    } catch (error) {
        console.error('Error al obtener detalle:', error);
        res.status(500).render('error', { message: 'Error interno al cargar la publicacion' });
    }
});

// 6. Perfil de Usuario
router.get('/profile/:id', opcionalAutenticacion, async (req, res) => {
    try {
        const id_usuario = parseInt(req.params.id);
        const user = await User.findByPk(id_usuario);

        if (!user) {
            return res.status(404).render('error', { message: 'Usuario no encontrado' });
        }

        if (!user.esta_activo) {
            return res.status(403).render('error', { 
                message: 'Esta cuenta ha sido desactivada por acumulacion de publicaciones dadas de baja.' 
            });
        }

        // Obtener publicaciones del usuario
        const posts = await Post.findAll({
            where: { id_autor: id_usuario },
            order: [['fecha_creacion', 'DESC']]
        });

        // Contar seguidores y seguidos
        const seguidoresCant = await Seguidor.count({ where: { id_seguido: id_usuario } });
        const seguidosCant = await Seguidor.count({ where: { id_seguidor: id_usuario } });

        // Verificar si el logueado lo sigue
        let loSigo = false;
        if (req.usuario) {
            const relacion = await Seguidor.findOne({
                where: { id_seguidor: req.usuario.id, id_seguido: id_usuario }
            });
            loSigo = !!relacion;
        }

        res.render('profile', {
            perfil: user.toJSON(),
            posts,
            seguidoresCant,
            seguidosCant,
            loSigo
        });

    } catch (error) {
        console.error('Error al cargar perfil:', error);
        res.status(500).render('error', { message: 'Error interno al cargar el perfil' });
    }
});

// Perfil rápido del usuario logueado
router.get('/my-profile', requiereAutenticacion, (req, res) => {
    res.redirect(`/profile/${req.usuario.id}`);
});

// 7. Notificaciones (Vista)
router.get('/notifications', requiereAutenticacion, async (req, res) => {
    try {
        const notificaciones = await Notificacion.findAll({
            where: { id_usuario_destino: req.usuario.id },
            include: [
                { model: User, as: 'UsuarioOrigen', attributes: ['id', 'username'] },
                { model: Post, attributes: ['id', 'titulo', 'imagen'] }
            ],
            order: [['fecha', 'DESC']]
        });

        res.render('notifications', { notificaciones });
    } catch (error) {
        res.status(500).render('error', { message: 'Error al cargar las notificaciones' });
    }
});

// 8. Colecciones y Favoritos (Vista)
router.get('/collections', requiereAutenticacion, async (req, res) => {
    try {
        const colecciones = await Coleccion.findAll({
            where: { id_usuario: req.usuario.id },
            include: [{
                model: Post,
                through: { attributes: [] }
            }],
            order: [['fecha_creacion', 'DESC']]
        });

        res.render('collections', { colecciones });
    } catch (error) {
        res.status(500).render('error', { message: 'Error al cargar colecciones' });
    }
});

// 9. Bandeja de Entrada de Mensajería
router.get('/messages', requiereAutenticacion, async (req, res) => {
    try {
        const userId = req.usuario.id;

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
                    otroUsuario: otroUsuario.toJSON(),
                    post: post.toJSON(),
                    ultimoMensaje: msg.contenido,
                    fecha: msg.fecha_envio
                });
            }
        }

        res.render('messages', { conversaciones });
    } catch (error) {
        res.status(500).render('error', { message: 'Error al cargar mensajes' });
    }
});

// Detalle de un chat privado específico
router.get('/messages/:otroUserId/:postId', requiereAutenticacion, async (req, res) => {
    try {
        const userId = req.usuario.id;
        const otroUserId = parseInt(req.params.otroUserId);
        const postId = parseInt(req.params.postId);

        const otroUsuario = await User.findByPk(otroUserId, { attributes: ['id', 'username'] });
        const post = await Post.findByPk(postId, { attributes: ['id', 'titulo', 'imagen'] });

        if (!otroUsuario || !post) {
            return res.status(404).render('error', { message: 'Chat no disponible. El usuario o publicacion no existen.' });
        }

        // Obtener historial de mensajes
        const mensajes = await Mensaje.findAll({
            where: {
                id_publicacion: postId,
                [Op.or]: [
                    { id_remitente: userId, id_destinatario: otroUserId },
                    { id_remitente: otroUserId, id_destinatario: userId }
                ]
            },
            order: [['fecha_envio', 'ASC']]
        });

        res.render('chat', {
            otroUsuario: otroUsuario.toJSON(),
            post: post.toJSON(),
            mensajes
        });
    } catch (error) {
        res.status(500).render('error', { message: 'Error al abrir la conversacion' });
    }
});

// 10. Panel del Validador de Contenidos
router.get('/validator', requiereAutenticacion, esValidador, async (req, res) => {
    try {
        const denuncias = await Denuncia.findAll({
            where: { estado: 'pendiente' },
            include: [
                { model: User, attributes: ['id', 'username'] }, // Denunciante
                { 
                    model: Post, 
                    include: [{ model: User, attributes: ['id', 'username'] }] // Post y su autor
                },
                { 
                    model: Comment, 
                    include: [{ model: User, attributes: ['id', 'username'] }] // Comentario y su autor
                }
            ],
            order: [['fecha_denuncia', 'ASC']]
        });

        res.render('validator', { denuncias });
    } catch (error) {
        res.status(500).render('error', { message: 'Error al cargar panel validador' });
    }
});

export default router;
