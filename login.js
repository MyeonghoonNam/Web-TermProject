var client = require("./mysql.js").mysql_pool;


exports.login = function(req,res,next){
    var id = req.body.id;
    var password = req.body.password;
    
    client.query('SELECT * FROM user WHERE id=? AND password=?', [id, password], function(err, rows){
        if(!err){
            if(rows[0] != undefined){
                res.cookie("auth",true);
                res.cookie("userinfo", {
                    userid:id,
                    userpassword:password,
                    usertype:rows[0].utype
                });
                res.redirect('/main');
            }
        } else{
            res.redirect('/'/*req.get('referer')*/);
            console.log('login Failed');
            throw err; 
        }
    });
}