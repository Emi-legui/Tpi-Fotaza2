import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';
import Post from './post.js';

const Notificacion = sequelize.define('Notificacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_evento: {
        type: DataTypes.ENUM('comentario', 'valoracion', 'interes', 'seguimiento'),
        allowNull: false
    },
    leida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'notificaciones',
    timestamps: true,
    createdAt: 'fecha',
    updatedAt: false
});

// Relaciones
// Usuario que recibe la notificacion
User.hasMany(Notificacion, { foreignKey: 'id_usuario_destino', as: 'NotificacionesRecibidas' });
Notificacion.belongsTo(User, { foreignKey: 'id_usuario_destino', as: 'UsuarioDestino' });

// Usuario que genera la accion de la notificacion
User.hasMany(Notificacion, { foreignKey: 'id_usuario_origen', as: 'NotificacionesGeneradas' });
Notificacion.belongsTo(User, { foreignKey: 'id_usuario_origen', as: 'UsuarioOrigen' });

// Publicacion asociada (opcional, por ejemplo, nulo para un seguimiento)
Post.hasMany(Notificacion, { foreignKey: 'id_publicacion', onDelete: 'CASCADE' });
Notificacion.belongsTo(Post, { foreignKey: 'id_publicacion' });

export default Notificacion;
