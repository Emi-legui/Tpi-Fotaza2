import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';

const Seguidor = sequelize.define('Seguidor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    tableName: 'seguidores',
    timestamps: true,
    createdAt: 'fecha_seguimiento',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['id_seguidor', 'id_seguido']
        }
    ]
});

// Relación auto-referencial (Muchos a Muchos)
// Un usuario sigue a muchos usuarios (Seguidos)
User.belongsToMany(User, { 
    as: 'Seguidos', 
    through: Seguidor, 
    foreignKey: 'id_seguidor', 
    otherKey: 'id_seguido' 
});

// Un usuario es seguido por muchos usuarios (Seguidores)
User.belongsToMany(User, { 
    as: 'Seguidores', 
    through: Seguidor, 
    foreignKey: 'id_seguido', 
    otherKey: 'id_seguidor' 
});

export default Seguidor;
