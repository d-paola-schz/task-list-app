const mysql = require("mysql2/promise");
require('dotenv').config();

async function initDatabase(config){
    const conn = await mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port,
        ssl: {rejectUnauthorized: false}
    });

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
    await conn.query(`USE \`${config.database}\`;`);

    try{
        await conn.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description TEXT,
                priority VARCHAR(10) DEFAULT 'Low' CHECK (priority IN ('High', 'Medium', 'Low')),
                due_date TIMESTAMP
            );      
        `);
    }catch(err){
        console.error("Database couldn't be initialized: ", err);
    }finally{
        await conn.end();
    }
}


module.exports = initDatabase;