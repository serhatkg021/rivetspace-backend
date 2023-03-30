const db = require('../config/db');
const { DataTypes } = require('sequelize');

const User_Profile = db.define('users_profiles', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

    mail: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },

    full_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },

    biography: {
        type: DataTypes.STRING,
    },

    updated_at: {
        type: DataTypes.DATE(3),
    }
});


module.exports = User_Profile