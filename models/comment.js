import {DataTypes} from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';
import Post from './post.js';

// Definición del modelo Comment (comentario)
const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false
    }, 
}, {
     
        tableName: 'comentarios', //Nombre de la tabla en la base de datos
        timestamps: true, // Agrega campos createdAt y updatedAt automáticamente
        createdAt: 'fecha_creacion', // Renombra el campo createdAt a fecha_creacion para que coicide con mi SQL
        updatedAt: false
    
});

// Relaciones entre Comment, User y Post
User.hasMany(Comment, {foreignKey: 'id_usuario'});
Comment.belongsTo(User, {foreignKey: 'id_usuario'});

Post.hasMany(Comment, {foreignKey: 'id_publicacion'});
Comment.belongsTo(Post, {foreignKey: 'id_publicacion'});

export default Comment;
