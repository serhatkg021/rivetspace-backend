const db = require('../config/db');
const { DataTypes } = require('sequelize');

const UserAuth = db.define('auth', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

    user_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    mail: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    mail_verify: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    created_at: {
        type: DataTypes.DATE(3),
    },

    updated_at: {
        type: DataTypes.DATE(3),
    }
}, {
    tableName: 'user_auth'
});


module.exports = UserAuth