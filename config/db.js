const { Sequelize } = require('sequelize');

const db = new Sequelize('rivetspace', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        timestamps: false
    },
    logging: false
});

module.exports = db;
