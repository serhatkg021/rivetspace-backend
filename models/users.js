const db = require('../config/db');
const { DataTypes } = require('sequelize');
const User_Profile = require('./users_profile.js');
const User = db.define('users', {
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

    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    profile_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {         // User belongsTo profile 1:1
            model: 'users_profiles',
            key: 'id'
        }
    },

    created_at: {
        type: DataTypes.DATE(3),
    },

    updated_at: {
        type: DataTypes.DATE(3),
    }
});

User.belongsTo(User_Profile, {
    foreignKey: 'profile_id'
});

module.exports = User