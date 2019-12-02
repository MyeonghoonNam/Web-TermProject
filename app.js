var fs = require('fs');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var client = require("./mysql.js").mysql_pool;
var user_insert = require('./user_insert.js');
var login = require('./login.js');
var ejs = require('ejs');

var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', express.static(__dirname));
app.get('/', function(req,res){
    res.writeHead(200, {'Content-Type':'text/html'});
    fs.readFile("./index.html", function(err,data){
        if(err) throw err;
        res.end(data, 'utf-8');
    });
});
app.get('/logout', function(req,res){
    res.clearCookie("auth");
    res.clearCookie("userinfo");
    res.redirect('/');
})
app.get('/main', function(req,res){
    let Cookie = req.cookies.auth;
    let UserCookie = req.cookies.userinfo;

    if(Cookie && UserCookie.usertype=="customer"){
        res.writeHead(200,{'Content-Type':'text/html'});
        fs.readFile('./main.html', 'utf8', function(err, data){
            if(err) throw err;
            client.query('select * from restaurant', function(err, result){
                res.end(ejs.render(data,{
                    result:result,
                    usercookie:UserCookie
                }));
            });
        });
    } else if(Cookie && UserCookie.usertype=="owner"){
        fs.readFile('./owner.html', 'utf-8',function(err,data){
            let sql = 'SELECT u.id, u.name, u.phone, o.ssid, o.address, o.mname, o.price, o.quantity, o.orderid FROM user AS u JOIN orderlist AS o ON u.id=o.orderid AND o.isOrdered=1;';
            client.query(sql, function(err,result){
                res.send(ejs.render(data, {
                    result:result,
                    usercookie:UserCookie
                }));
            });
        });
    } else{
        res.redirect('/');
    }
});

app.use('/main', express.static(__dirname));
app.get('/main/:id', function(req,res){
    let Cookie = req.cookies.auth;
    let UserCookie = req.cookies.userinfo;
 
    if(Cookie){
        fs.readFile('menu.html', 'utf-8', function(err, data){
            let sql = 'SELECT title, COUNT(title) AS cnt FROM menu GROUP BY title;' + 'SELECT r.id, r.name, r.minprice, r.image, m.m_name, m.title, m.price, m.title FROM restaurant AS r JOIN menu AS m ON r.name = m.r_name WHERE r.id=?;' + 'SELECT * FROM orderlist WHERE orderid = ?;';
            client.query(sql, [req.params.id, req.cookies.userinfo.userid], function(err, result){
                res.send(ejs.render(data,{
                    result:result[0],
                    result2:result[1],
                    result3:result[2],
                    usercookie:UserCookie
                }));
            });
        });
    } else{
        res.redirect('/');
    }
});

app.get('/sign', function(req, res){
    res.writeHead(200, {'Content-Type':'text/html'});
    fs.readFile('./sign.html', function(err, data){
        if(err) throw err;
        res.end(data, 'utf-8');
    });
});
app.get('/sign_complete', function(req,res){
    res.writeHead(200, {'Content-Type':'text/html'});
    fs.readFile('./sign_complete.html', function(err, data){
        if (err) throw err;
        res.end(data, 'utf-8');
    });
});

app.use('/order', express.static(__dirname));
app.get('/order/check', function(req,res){
    let Cookie = req.cookies.auth;
    let UserCookie = req.cookies.userinfo;
    if(Cookie){
        fs.readFile('./order.html', 'utf-8',function(err,data){
            let sql = 'SELECT u.id, u.name, u.phone, o.address, o.mname, o.price, o.quantity FROM user AS u JOIN orderlist AS o ON u.id = o.orderid WHERE u.id=?';
            client.query(sql, [UserCookie.userid], function(err,result){
                res.send(ejs.render(data, {
                    result:result,
                    usercookie:UserCookie
                }));
            });
        });
    }
});
app.get('/order/success', function(req,res){
    let Cookie = req.cookies.auth;
    let UserCookie = req.cookies.userinfo;
    if(Cookie){
        fs.readFile('./orderfinal.html', 'utf-8',function(err,data){
            let sql = 'SELECT u.id, u.name, u.phone, o.address, o.mname, o.price, o.quantity FROM user AS u JOIN orderlist AS o ON u.id = o.orderid WHERE u.id=?';
            client.query(sql, [UserCookie.userid], function(err,result){
                res.send(ejs.render(data, {
                    result:result,
                    usercookie:UserCookie
                }));
            });
        });
    }
})
app.post('/orderadrinsert', function(req,res){
    let address = req.body.address;
    let sql = "UPDATE orderlist SET address=? WHERE orderid IN (SELECT id FROM user WHERE id=?);"
    client.query(sql, [address, req.cookies.userinfo.userid], function(err,result){
        res.redirect('/order/success');
    });
});

app.post('/login', login.login);
app.post('/user_insert', user_insert.insert);
app.post('/insert_orderlist', function(req,res){
    let orderid = req.cookies.userinfo.userid;
    let name = req.body.h_name;
    let price = req.body.h_price;
    let quantity = req.body.modal_body_quantity
    let isOrdered = 1;
    let sql = 'insert into orderlist (orderid, mname, price, quantity, isOrdered) values (?, ?, ?, ?, ?);';
    client.query(sql,[orderid, name, price, quantity, isOrdered], function(err, result){
        if(err) throw err;
        res.redirect(req.get('referer'));
    });
})

app.post('/delete_orderlist_right/:id', function(req,res){
    let sql = 'delete from orderlist WHERE ssid=?;';
    client.query(sql, [req.params.id], function(err, result){
        if(err) throw err;
        res.redirect(req.get('referer'));
    });
});

app.post('/delete_owner_orderlist/:id', function(req,res){
    let sql = 'UPDATE orderlist AS o SET o.isOrdered=0 WHERE ssid=?;';
    client.query(sql, [req.params.id], function(err, result){
        if(err) throw err;
        res.redirect('/main');
    });
});




var upload = multer({dest:'./uploads'});
app.use('/image', express.static('./uploads'));

// 
app.get('/filepage', function(req,res){
    //var path = __dirname + 'uploads';
    res.writeHead(200, {'Content-Type':'text/html'});
    fs.readFile('./filepage.html', function(err,data){
        res.end(data);
        });
});
// 
app.post('/upload_images', upload.single('image'), function(req, res){
    let file = req.file;
    let result = {
        filename:file.filename
    };
    let name = req.body.name;
    let minprice = req.body.minprice;
    let callnum = req.body.callnum;
    let image = '/image/' + result.filename;
    let group = req.body.group;
    let sql = 'insert into restaurant values (null, ?, ?, ?, ?, ?)';
    let params = [name, minprice, callnum, image, group]
    client.query(sql, params, function(err, result){
        if(err){
            console.log(err);
        }
        res.redirect('/filepage');
    });
});



app.listen(3000, function(){
    console.log("Surver Running at port : 3000");
});