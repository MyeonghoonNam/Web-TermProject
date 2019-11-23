var mysql = require('mysql');
var mysqldb = {
    mysql_pool : mysql.createPool({
        host     : 'localhost',
        user     : 'root',
        password : 'nmh147852',
        database : 'TERMPROJECT',
        port : 3306
    })
};
module.exports = mysqldb;
