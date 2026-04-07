const mysql = require('mysql2');

const pool = mysql.createPool({
   host: '192.168.56.3',
   user: 'eugene',
   password:'ghdrldud10',
   database: 'seoyeon',
   waitforconnections: true,
   connectionLimit: 10
});

module.exports = pool.promise();


