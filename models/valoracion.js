import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';
import Post from './post.js';

const Valoracion = sequelize.define('Valoracion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    calificacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    }
}, {
    tableName: 'valoraciones',
    timestamps: true,
    createdAt: 'fecha_valoracion',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            // Evita votos duplicados del mismo usuario en la misma foto
            fields: ['id_usuario', 'id_publicacion'] 
        }
    ]
});

// Relaciones
User.hasMany(Valoracion, { foreignKey: 'id_usuario' });
Valoracion.belongsTo(User, { foreignKey: 'id_usuario' });

Post.hasMany(Valoracion, { foreignKey: 'id_publicacion', onDelete: 'CASCADE' });
Valoracion.belongsTo(Post, { foreignKey: 'id_publicacion' });

export default Valoracion;
