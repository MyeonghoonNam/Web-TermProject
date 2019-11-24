var multer = require('multer');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var client = require("./mysql.js").mysql_pool;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));

var storage = multer.diskStorage({
    destination: function(req,file,cb){
        if(file.mimetype=="image/jpg"){
            console.log("이미지 파일");
            cb(null, 'uploads');
        }
    }
});

var upload = multer({stroage:storage});
app.use('/image', express.static('./upload'));
app.get('/filepage', function(req,res){
    var path = __dirname + 'uploads';

    fs.readFile('filepage.html', function(err,data){
        let sql = 'select * from restaurant';
        client.query(sql, function(err,result){
            if(err){
                console.log("faild");
                return;
            }
            res.send(data);
        });
    });
});
app.post('/upload_images', upload.single('image'), function(req, res){
    let name = req.body.name;
    let minprice = req.body.minprice;
    let callnum = req.body.callnum;
    let image = '/image/' + req.file.filename;
    let sql = 'insert into restaurant values (null, ?, ?, ?, ?)';
    let params = [name, minprice, callnum, image]
    client.query(sql, params, function(err, result){
        res.redirect('/filepage');
    });
});

app.listen(52273, function(){
    console.log("Server Running");
});
module.exports = router