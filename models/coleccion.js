import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';

const Coleccion = sequelize.define('Coleccion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'colecciones',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['nombre', 'id_usuario'] // Un usuario no puede tener colecciones duplicadas con el mismo nombre
        }
    ]
});

// Relaciones
User.hasMany(Coleccion, { foreignKey: 'id_usuario' });
Coleccion.belongsTo(User, { foreignKey: 'id_usuario' });

export default Coleccion;
