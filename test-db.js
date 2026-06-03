import  sequelize  from './config/database.js';

async function probarConexion() {
    try{
        await sequelize.authenticate();
        console.log('Conexión establecida correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error.message );

    } finally {
        process.exit();
    }
}
probarConexion();