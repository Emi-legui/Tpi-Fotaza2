import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Post from './post.js';
import Tag from './tag.js';

const PostTag = sequelize.define('PostTag', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    tableName: 'publicaciones_etiquetas',
    timestamps: false
});

// Relación Muchos a Muchos
Post.belongsToMany(Tag, { through: PostTag, foreignKey: 'id_publicacion', otherKey: 'id_etiqueta' });
Tag.belongsToMany(Post, { through: PostTag, foreignKey: 'id_etiqueta', otherKey: 'id_publicacion' });

export default PostTag;
