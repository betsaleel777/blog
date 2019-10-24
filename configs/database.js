let mysql = require('mysql');
let connexion = mysql.createConnection({
  host: 'localhost',
  user: 'shin',
  password: 'keygen1995',
  database: 'blog'
});
connexion.connect();
module.exports = connexion;
