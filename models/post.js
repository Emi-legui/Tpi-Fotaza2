import {DataTypes} from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';

// Definición del modelo Post (publicación)
// (la estructura de la tabla en la base de datos)
const Post = sequelize.define('Post', {
    id: {
        type: DataTypes. INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
});