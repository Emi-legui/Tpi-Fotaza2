import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';
import Post from './post.js';

const Mensaje = sequelize.define('Mensaje', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'mensajes',
    timestamps: true,
    createdAt: 'fecha_envio',
    updatedAt: false
});

// Relaciones
// Usuario que envia el mensaje
User.hasMany(Mensaje, { foreignKey: 'id_remitente', as: 'MensajesEnviados' });
Mensaje.belongsTo(User, { foreignKey: 'id_remitente', as: 'Remitente' });

// Usuario que recibe el mensaje
User.hasMany(Mensaje, { foreignKey: 'id_destinatario', as: 'MensajesRecibidos' });
Mensaje.belongsTo(User, { foreignKey: 'id_destinatario', as: 'Destinatario' });

// Publicacion por la que se inicio el contacto
Post.hasMany(Mensaje, { foreignKey: 'id_publicacion', onDelete: 'SET NULL' });
Mensaje.belongsTo(Post, { foreignKey: 'id_publicacion' });

export default Mensaje;
