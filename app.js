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
app.get('/main', function(req,res){
    res.writeHead(200,{'Content-Type':'text/html'});
    fs.readFile('./main.html', 'utf8',function(err, data){
        if(err) throw err;
        client.query('select * from restaurant', function(err, result){
            res.end(ejs.render(data,{result:result}));
        });
    });
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
app.post('/login', login.login);
app.post('/user_insert', user_insert.insert);



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

app.use('/main', express.static(__dirname));
app.get('/main/:id', function(req,res){
    fs.readFile('menu.html', 'utf-8', function(err, data){
        let sql = 'SELECT title, COUNT(title) AS cnt FROM menu GROUP BY title;' + 'SELECT r.name, r.minprice, r.image, m.m_name, m.title, m.price, m.set_price, m.title FROM restaurant AS r JOIN menu AS m ON r.name = m.r_name WHERE r.id=?'
        client.query(sql, [req.params.id], function(err, result){
            res.send(ejs.render(data,{
                result:result[0],
                result2:result[1]
            }));
        });
    });
});

app.listen(3000, function(){
    console.log("Surver Running at port : 3000");
});