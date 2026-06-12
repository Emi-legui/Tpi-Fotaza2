import sequelize from '../config/database.js';
import User from '../models/user.js';
import Post from '../models/post.js';
import Comment from '../models/comment.js';
import Denuncia from '../models/denuncia.js';
import Tag from '../models/tag.js';
import PostTag from '../models/postTag.js';
import Valoracion from '../models/valoracion.js';
import Seguidor from '../models/seguidor.js';
import Notificacion from '../models/notificacion.js';
import Coleccion from '../models/coleccion.js';
import ColeccionPost from '../models/coleccionPost.js';
import Mensaje from '../models/mensaje.js';

async function sincronizarBaseDeDatos() {
    try {
        console.log('Sincronizando base de datos...');
        await sequelize.sync({ force: true });
        console.log('Tablas creadas con éxito.');

        console.log('Sembrando datos de prueba...');

        // 1. Usuarios (individualHooks: true para ejecutar la encriptació}o n de contraseñas de bcrypt)
        const usuarios = await User.bulkCreate([
            {
                username: 'admin_validador',
                email: 'validador@fotaza.com',
                password: 'adminpassword',
                es_validador: true
            },
            {
                username: 'carlos_perez',
                email: 'carlos@gmail.com',
                password: 'userpassword',
                es_validador: false
            },
            {
                username: 'maria_lopez',
                email: 'maria@gmail.com',
                password: 'userpassword',
                es_validador: false
            },
            {
                username: 'juan_gomez',
                email: 'juan@gmail.com',
                password: 'userpassword',
                es_validador: false
            }
        ], { individualHooks: true });

        const [admin, carlos, maria, juan] = usuarios;
        console.log('Usuarios creados.');

        // 2. Etiquetas (Tags)
        const etiquetas = await Tag.bulkCreate([
            { nombre: 'paisaje' },
            { nombre: 'naturaleza' },
            { nombre: 'urbano' },
            { nombre: 'arquitectura' },
            { nombre: 'retrato' }
        ]);
        const [tPaisaje, tNaturaleza, tUrbano, tArquitectura, tRetrato] = etiquetas;
        console.log('Etiquetas creadas.');

        // 3. Publicaciones (Posts)
        const post1 = await Post.create({
            titulo: 'Atardecer en la montaña',
            descripcion: 'Un hermoso atardecer libre de copyright para uso público.',
            imagen: '/uploads/atardecer.jpg',
            licencia: 'libre',
            id_autor: carlos.id
        });

        const post2 = await Post.create({
            titulo: 'Rascacielos de noche',
            descripcion: 'Fotografía nocturna protegida de la gran ciudad.',
            imagen: '/uploads/rascacielos.jpg',
            licencia: 'copyright',
            marca_agua_texto: '© Maria Lopez',
            id_autor: maria.id
        });

        const post3 = await Post.create({
            titulo: 'Flores silvestres',
            descripcion: 'Detalle macro de flores en primavera.',
            imagen: '/uploads/flores.jpg',
            licencia: 'libre',
            id_autor: juan.id
        });
        console.log('Publicaciones creadas.');

        // Asociar etiquetas
        await post1.addTags([tPaisaje, tNaturaleza]);
        await post2.addTags([tUrbano, tArquitectura]);
        await post3.addTags([tNaturaleza]);
        console.log('Etiquetas asociadas a publicaciones.');

        // 4. Comentarios
        await Comment.bulkCreate([
            {
                contenido: '¡Qué hermosos colores en ese cielo!',
                id_usuario: maria.id,
                id_publicacion: post1.id
            },
            {
                contenido: 'Espectacular toma, ¿usaste un trípode?',
                id_usuario: juan.id,
                id_publicacion: post1.id
            },
            {
                contenido: 'Increíble perspectiva y nitidez.',
                id_usuario: carlos.id,
                id_publicacion: post2.id
            }
        ]);
        console.log('Comentarios creados.');

        // 5. Valoraciones
        await Valoracion.bulkCreate([
            {
                calificacion: 5,
                id_usuario: maria.id,
                id_publicacion: post1.id
            },
            {
                calificacion: 4,
                id_usuario: juan.id,
                id_publicacion: post1.id
            },
            {
                calificacion: 5,
                id_usuario: carlos.id,
                id_publicacion: post2.id
            }
        ]);
        console.log('Valoraciones creadas.');

        // 6. Seguidores
        await Seguidor.bulkCreate([
            { id_seguidor: carlos.id, id_seguido: maria.id },
            { id_seguidor: maria.id, id_seguido: carlos.id },
            { id_seguidor: juan.id, id_seguido: carlos.id }
        ]);
        console.log('Relaciones de seguimiento creadas.');

        // 7. Notificaciones semilla
        await Notificacion.bulkCreate([
            {
                tipo_evento: 'comentario',
                leida: false,
                id_usuario_destino: carlos.id,
                id_usuario_origen: maria.id,
                id_publicacion: post1.id
            },
            {
                tipo_evento: 'valoracion',
                leida: false,
                id_usuario_destino: carlos.id,
                id_usuario_origen: juan.id,
                id_publicacion: post1.id
            },
            {
                tipo_evento: 'seguimiento',
                leida: false,
                id_usuario_destino: maria.id,
                id_usuario_origen: carlos.id
            }
        ]);
        console.log('Notificaciones creadas.');

        // 8. Colecciones semilla
        const colecMaria = await Coleccion.create({
            nombre: 'Favoritos',
            id_usuario: maria.id
        });
        await ColeccionPost.create({
            id_coleccion: colecMaria.id,
            id_publicacion: post1.id
        });
        console.log('Colecciones y favoritos creados.');

        console.log('¡Base de datos sembrada con éxito!');
    } catch (error) {
        console.error('Error al sincronizar/sembrar la base de datos:', error);
    } finally {
        process.exit();
    }
}

sincronizarBaseDeDatos();