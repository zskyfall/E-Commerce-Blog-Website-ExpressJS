var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var app = express();



var router = express.Router();


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));



router.get('/',function(req,res){
	res.render('test');
});

router.get('/test',function(req,res){
	var ad = administrator.find({},function(err,ad){
			if(!err){
				res.send(ad);
			}
	});
});

router.post('/uploader', multipartMiddleware, function(req, res) {
    var fs = require('fs');
    console.log(req.files.upload.name);

    fs.readFile(req.files.upload.path, function (err, data) {
        var newPath = __dirname + '/../public/uploads/images/' + req.files.upload.name;
        fs.writeFile(newPath, data, function (err) {
            if (err) console.log({err: err});
            else {
                html = "";
                html += "<script type='text/javascript'>";
                html += "    var funcNum = " + req.query.CKEditorFuncNum + ";";
                html += "    var url     = \"/uploads/images/" + req.files.upload.name + "\";";
                html += "    var message = \"Uploaded file successfully\";";
                html += "";
                html += "    window.parent.CKEDITOR.tools.callFunction(funcNum, url, message);";
                html += "</script>";

                res.send(html);
            }
        });
    });
});


router.get('/browser', multipartMiddleware, function(req, res) {
		var funcNum = req.query.CKEditorFuncNum;

		var path = __dirname + '/../public/uploads/images/';
		
		
		fs.readdir(path, function(err,files){
				if(!err){
					res.render("images_browser",{funcNum:funcNum,images_list: files});
				}
				else{
					console.log("loi");
				}
		});

    	
});




/* GET users listing. */



router.get('/product', function(req, res, next) {
  var id = req.query.id;
  var action = req.query.action;
  if(id != null && action == "edit"){
  		res.render('edit_product');
  }
  else if(action == "add"){
  		res.render('add_product');
  }
  
});







module.exports = router;
