import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';
import Post from './post.js';

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
    estado: {
        type: DataTypes.ENUM('pendiente', 'resuelta', 'rechazada'),
        defaultValue: 'pendiente'// Estado de la denuncia
    }
}, {
    tableName: 'denuncias',
    timestamps: true, //Registra cuando se hizo la denuncia
    createdAt: 'fecha_denuncia',
    updatedAt: false
});
// Relaciones
// Una denuncia pertenece a un usuario (quien la hizo)
User.hasMany(Denuncia, { foreignKey: 'id_usuario_denunciante' });
Denuncia.belongsTo(User, { foreignKey: 'id_usuario_denunciante' });

Post.hasMany(Denuncia, { foreignKey: 'id_publicacion' });
Denuncia.belongsTo(Post, { foreignKey: 'id_publicacion' });

export default Denuncia;