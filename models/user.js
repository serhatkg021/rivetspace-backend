const db = require('../config/db');
const { DataTypes } = require('sequelize');
const UserAuth = require('./user_auth.js');

const User = db.define('User', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

    auth_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {         // User belongsTo profile 1:1
            model: 'user_auth',
            key: 'id'
        }
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
}, {
    tableName: 'user'
});

User.belongsTo(UserAuth, {
    foreignKey: 'auth_id'
});

module.exports = User