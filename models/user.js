import {DataTypes} from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';
import { Hooks } from 'sequelize/lib/hooks';

const User = sequelize.define('User',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
    },

    es_validaor: { 
        type: DataTypes.BOOLEAN,
        defaultValue: false 
    },
    esta_activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true 
    },
    Hooks: {
        //antes de crear o actualizar un usuario, se encripta la contraseña
        beforeCreate: async (user) => {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        },
        
        beforeUpdate: async (user) => {
            if(user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }

});
export default User;