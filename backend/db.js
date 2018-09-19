let mysql = require('mysql')

let pool = mysql.createPool({
    connectionLimit: 100,
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'ocean'
  });

  module.exports=pool