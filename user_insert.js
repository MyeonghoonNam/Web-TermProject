var client = require("./mysql.js").mysql_pool;

exports.insert = function(req,res){
  var id = req.body.id;
  var password = req.body.password;
  var name = req.body.name;
  var phone = req.body.phone;
  var utype = req.body.utype;


  client.query('insert into user (id, password, name, phone, utype) values (?, ?, ?, ?, ?)',[id, password, name, phone, utype], function(err, result){
    if(err){
      res.json({code:500});
      console.log(err)
    }else{
      console.log('insert success')    //쓰기성공
      res.redirect('/sign_complete'); //req.get('referer');
    }
  })
}
