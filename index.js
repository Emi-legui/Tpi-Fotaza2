import express from 'express';
import sequelize from './config/database.js';
import User from './models/user.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);

// Iniciamos la conexion con la base de datos
sequelize.sync({ force: false })
    .then(() => {
        console.log('Conexión con la base de datos exitosa.');
        
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error('Error al conectar con la base de datos:', error);
    });