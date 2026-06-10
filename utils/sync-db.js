import sequelize from '../config/database.js';
import User from '../models/user.js';
import Post from '../models/post.js';
import Comment from '../models/comment.js';
import Denuncia from '../models/denuncia.js';

async function sincronizarBaseDeDatos() {
    try {
        await sequelize.sync({ force: true });
        console.log('Tablas creadas con exito en la base de datos.');
    } catch (error) {
        console.error('Error al sincronizar la base de datos:', error.message);
    } finally {
        process.exit();
    }
}
sincronizarBaseDeDatos();