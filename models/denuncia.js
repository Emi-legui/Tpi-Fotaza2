import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';
import Post from './post.js';
import Comment from './comment.js';

const Denuncia = sequelize.define('Denuncia', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: false // Motivo de la denuncia
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true // Justificacion de la denuncia
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'resuelta', 'rechazada'),
        defaultValue: 'pendiente' // Estado de la denuncia
    }
}, {
    tableName: 'denuncias',
    timestamps: true, // Registra cuando se hizo la denuncia
    createdAt: 'fecha_denuncia',
    updatedAt: false
});

// Relaciones
// Una denuncia pertenece al usuario que la creo
User.hasMany(Denuncia, { foreignKey: 'id_usuario_denunciante' });
Denuncia.belongsTo(User, { foreignKey: 'id_usuario_denunciante' });

// Una denuncia puede estar asociada a una publicación
Post.hasMany(Denuncia, { foreignKey: 'id_publicacion' });
Denuncia.belongsTo(Post, { foreignKey: 'id_publicacion' });

// Una denuncia puede estar asociada a un comentario
Comment.hasMany(Denuncia, { foreignKey: 'id_comentario', onDelete: 'CASCADE' });
Denuncia.belongsTo(Comment, { foreignKey: 'id_comentario' });

export default Denuncia;