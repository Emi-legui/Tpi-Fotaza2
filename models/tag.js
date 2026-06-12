import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'etiquetas',
    timestamps: false
});

export default Tag;
