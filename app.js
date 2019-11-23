var fs = require('fs');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var user_insert = require('./user_insert.js');
var login = require('./login.js');

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
    fs.readFile('./main.html', function(err, data){
        if(err) throw err;
        res.end(data,'utf-8');
    });
});
app.post('/login', login.login);

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

app.post('/user_insert', user_insert.insert);

app.listen(3000, function(){
    console.log("Surver Running at port : 3000");
});