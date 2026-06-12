import cookieParser from 'cookie-parser';
import express from 'express';
import sequelize from './config/database.js';

// Importar todos los modelos para asegurar que se definan las relaciones en Sequelize
import User from './models/user.js';
import Post from './models/post.js';
import Comment from './models/comment.js';
import Denuncia from './models/denuncia.js';
import Tag from './models/tag.js';
import PostTag from './models/postTag.js';
import Valoracion from './models/valoracion.js';
import Seguidor from './models/seguidor.js';
import Notificacion from './models/notificacion.js';
import Coleccion from './models/coleccion.js';
import ColeccionPost from './models/coleccionPost.js';
import Mensaje from './models/mensaje.js';

// Importar rutas
import pageRoutes from './routes/pageRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import denunciaRoutes from './routes/denunciaRoutes.js';
import valoracionRoutes from './routes/valoracionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

const app = express();

// Configuración de Pug como motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

// Middleware para parsear JSON, formularios y cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Carpeta pública para archivos estáticos (CSS, JS, imágenes subidas)
app.use(express.static('public'));

// Rutas de Páginas Principales (Frontend)
app.use('/', pageRoutes);

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/denuncias', denunciaRoutes);
app.use('/api/valoraciones', valoracionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/messages', messageRoutes);

// Iniciamos la conexión con la base de datos
sequelize.sync()
    .then(() => {
        console.log('Base de datos sincronizada.');
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error('Error al conectar con la base de datos:', error);
    });