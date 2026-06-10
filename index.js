import express from 'express';
import sequelize from './config/database.js';
import User from './models/user.js';
import Post from './models/post.js';
import Comment from './models/comment.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import denunciaRoutes from './routes/denunciaRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Configuración de Pug como motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/denuncias', denunciaRoutes);
app.use('/api/auth', authRoutes);

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
    })