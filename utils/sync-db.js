import sequelize from '../config/database.js';
import User from '../models/user.js';

async function sincronizarBaseDeDatos() {
    try {
        await sequelize.sync({ force: true });
        console.log('Tablas creadas con exito en la base de datos.');
    } catch (error) {
        console.error('Error al sincronizar:', error.message);
    } finally {
        process.exit();
    }
}
sincronizarBaseDeDatos();