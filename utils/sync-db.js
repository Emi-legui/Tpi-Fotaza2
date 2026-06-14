import sequelize from '../config/database.js';

// Importar todos los modelos para que Sequelize los registre y los cree en orden de relacion
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
        console.log('Tablas creadas con exito.');

        console.log('Sembrando datos de prueba...');

        // 1. Usuario Validador Administrador (individualHooks: true para encriptar la contrasena con bcrypt)
        await User.create({
            username: 'admin_validador',
            email: 'validador@fotaza.com',
            password: 'adminpassword',
            es_validador: true
        }, { individualHooks: true });

        console.log('Usuario validador creado.');

        // 2. Etiquetas (Tags)
        await Tag.bulkCreate([
            { nombre: 'paisaje' },
            { nombre: 'naturaleza' },
            { nombre: 'urbano' },
            { nombre: 'arquitectura' },
            { nombre: 'retrato' }
        ]);
        console.log('Etiquetas creadas.');

        console.log('Base de datos sembrada con exito!');
    } catch (error) {
        console.error('Error al sincronizar/sembrar la base de datos:', error);
    } finally {
        process.exit();
    }
}

sincronizarBaseDeDatos();