require('dotenv').config();
//Arquivo ignorado
module.exports = {
    username: 'alessandrodev01',
    password: 'nodpredesocial1',
    database: 'alessandrodev01',
    host:'mysql.alessandrodev.com',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

