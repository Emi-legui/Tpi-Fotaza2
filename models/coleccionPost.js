import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Coleccion from './coleccion.js';
import Post from './post.js';

const ColeccionPost = sequelize.define('ColeccionPost', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    tableName: 'colecciones_publicaciones',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['id_coleccion', 'id_publicacion'] // No se puede guardar la misma publicacion dos veces en la misma coleccion
        }
    ]
});

// Relacion Muchos a Muchos
Coleccion.belongsToMany(Post, { through: ColeccionPost, foreignKey: 'id_coleccion', onDelete: 'CASCADE' });
Post.belongsToMany(Coleccion, { through: ColeccionPost, foreignKey: 'id_publicacion', onDelete: 'CASCADE' });

export default ColeccionPost;
