import {DataTypes} from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';

// Definición del modelo Post (publicación)
// (la estructura de la tabla en la base de datos)
const Post = sequelize.define('Post', {
    id: {
        type: DataTypes. INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    comentarios_abiertos:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
},
 {
    tableName: 'publicaciones', //Nombre de la tabla en la base de datos
    timestamps: true, // Agrega campos createdAt y updatedAt automáticamente
    createdAt: 'fecha_creacion', // Renombra el campo createdAt a fecha_creacion para que coicide con mi SQL
    updatedAt: false
});
 
//Relacion entre Post y User (un post pertenece a un usuario)
User. hasMany(Post, {foreignKey: 'id_autor'}); 
// Un usuario puede tener muchas publicaciones
Post.belongsTo(User, {foreignKey: 'id_autor'});
// Una publicación pertenece a un usuario (autor)

export default Post;