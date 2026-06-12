import Denuncia from '../models/denuncia.js';
import Post from '../models/post.js';
import User from '../models/user.js';
import Comment from '../models/comment.js';

// Función para contar las denuncias pendientes sobre un post
export async function verificarEstadoPublicacion(id_publicacion) {
    const cantidadDenuncias = await Denuncia.count({
        where: { 
            id_publicacion: id_publicacion, 
            estado: 'pendiente' 
        }
    });
    
    // Devuelve true si tiene 3 o mas, false si tiene menos
    return cantidadDenuncias >= 3;
}

// Función para obtener las denuncias pendientes con relaciones para el panel del Validador
export async function obtenerDenunciasPendientes(req, res) {
    try {
        const denuncias = await Denuncia.findAll({
            where: { estado: 'pendiente' },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username'] // Denunciante
                },
                {
                    model: Post,
                    include: [{ model: User, attributes: ['id', 'username'] }] // Post denunciado y su autor
                },
                {
                    model: Comment,
                    include: [{ model: User, attributes: ['id', 'username'] }] // Comentario denunciado y su autor
                }
            ],
            order: [['fecha_denuncia', 'ASC']]
        });
        
        res.json(denuncias);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener denuncias pendientes', 
            message: error.message 
        });
    }
}

// Resuelve una denuncia (dar de baja o desestimar)
export async function resolverDenuncia(req, res) {
    try {
        const { id } = req.params;
        const { accion } = req.body; // Se espera 'bajar' (dar de baja) o 'desestimar'

        const denuncia = await Denuncia.findByPk(id);
        if (!denuncia) {
            return res.status(404).json({ error: 'Denuncia no encontrada' });
        }

        if (accion === 'bajar') {
            // Caso 1: Denuncia de Publicación
            if (denuncia.id_publicacion) {
                const post = await Post.findByPk(denuncia.id_publicacion);
                if (post) {
                    const autorId = post.id_autor;
                    
                    // Eliminar publicación (borrar de base de datos, lo cual borra en cascada denuncias asociadas)
                    await post.destroy();

                    // Incrementar contador de bajas del autor
                    const autor = await User.findByPk(autorId);
                    if (autor) {
                        autor.publicaciones_bajadas += 1;
                        if (autor.publicaciones_bajadas >= 3) {
                            autor.esta_activo = false; // Desactivar cuenta al llegar a 3 bajas
                        }
                        await autor.save();
                    }
                }
                
                // Actualizar todas las demás denuncias pendientes de esta publicación a 'resuelta'
                await Denuncia.update(
                    { estado: 'resuelta' },
                    { where: { id_publicacion: denuncia.id_publicacion, estado: 'pendiente' } }
                );
            } 
            // Caso 2: Denuncia de Comentario
            else if (denuncia.id_comentario) {
                const comentario = await Comment.findByPk(denuncia.id_comentario);
                if (comentario) {
                    await comentario.destroy();
                }
                
                // Actualizar todas las denuncias pendientes de este comentario a 'resuelta'
                await Denuncia.update(
                    { estado: 'resuelta' },
                    { where: { id_comentario: denuncia.id_comentario, estado: 'pendiente' } }
                );
            }

            res.json({ message: 'El contenido ha sido dado de baja correctamente' });

        } else if (accion === 'desestimar') {
            // Desestimar/Rechazar la denuncia actual
            denuncia.estado = 'rechazada';
            await denuncia.save();

            // Si es un post, desestimamos todas las denuncias pendientes de este post
            if (denuncia.id_publicacion) {
                await Denuncia.update(
                    { estado: 'rechazada' },
                    { where: { id_publicacion: denuncia.id_publicacion, estado: 'pendiente' } }
                );
            }
            // Si es un comentario, desestimamos todas las denuncias pendientes de este comentario
            else if (denuncia.id_comentario) {
                await Denuncia.update(
                    { estado: 'rechazada' },
                    { where: { id_comentario: denuncia.id_comentario, estado: 'pendiente' } }
                );
            }

            res.json({ message: 'Las denuncias han sido desestimadas correctamente' });
        } else {
            res.status(400).json({ error: 'Acción no válida. Se espera "bajar" o "desestimar"' });
        }

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al procesar la resolución de la denuncia', 
            message: error.message 
        });
    }
}