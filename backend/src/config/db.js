const mysql = require('mysql2/promise');
const { config } = require('./env');

const db = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

module.exports = { db };
