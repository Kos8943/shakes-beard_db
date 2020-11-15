const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port:8889,
    database: 'shakes-beard',
    waitForConnections: 'true',
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();