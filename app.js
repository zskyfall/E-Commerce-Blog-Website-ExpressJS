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
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var flash = require('connect-flash');

var db = require('./model/db.js');
var adminSchema = db.Schema({
  email: String,
  password: String,
  username: String,
  name: String,
  level: Number
});

var categorySchema = db.Schema({
	code: String,
	name: String,
	permalink: String,
	parent: String,
	description: String
});

var blog_categorySchema = db.Schema({
	code: String,
	name: String,
	permalink: String,
	parent: String,
	description: String
});

var productSchema = db.Schema({
	name: String,
	category: String,
	keywords: String,
	image: String,
	description: String,
	price: String,
	sale_price: String,
	code: String,
	amount: Number,
	stock_status: Boolean,
	weight: String,
	length: String,
	width: String,
	height: String,
	payment_method: String,
	short_description: String
});

var articleSchema = db.Schema({
	created_at: String,
	update_at: String,
	author_name: String,
	author_id: String,
	title: String,
	category: String,
	keywords: String,
	image: String,
	video: String,
	content: String,                            
	short_description: String,
	rich_snippet: String,
	permalink: String,
	view: Number
});


var article = db.model('Article',articleSchema);

var product = db.model('Product',productSchema);

var category = db.model('Category',categorySchema);

var blog_category = db.model('Blog_category',blog_categorySchema);

var administrator = db.model('Admin',adminSchema);

//End MongoDB
var admin = require('./routes/admin');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname + '/public')));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(flash());

//Get Router
app.get('/',function(req,res){
		var pro = product.find({},function(err,pro){
				if(!err){
						var cat = category.find({},function(er,cat){
								if(!er){
									res.render('product',{product:pro,category:cat});
								}
								else{
									res.send("Lỗi find category");
								}
						});
				}
				else{
					res.send("Lỗi find product");
				}
		});
});

app.get('/register',function(req,res){
	res.render('register');
});

app.get('/login',function(req,res){
	res.render('login');
});

app.get('/admin/login',function(req,res){
	res.render('login_admin');
});

app.get('/forget-password',function(req,res){
	res.render('forget_password');
});

app.get('/blog',function(req,res){
	res.render('blog');
});

app.get('/blank',function(req,res){
	res.render('blank page');
});









//TEST
app.get('/test/create-admin',function(req,res){
    var ad = new administrator({
        username: 'admin',
        password: 'shavker',
        email: 'ginzed23@gmail.com',
        name:'Nguyễn Hữu Thắng',
        level: 0
    });

    ad.save(function(err){
        if(err) res.send("lỗi save ad");
        else{
            res.send("ok");
        }
    });
});

//End TEST


//ADMIN Get Router
app.get('/admin/seo-research-oponent',function(req,res){
	res.render('seo_research_oponent');
});

app.get('/admin',function(req,res){
	
	var ad = req.session.logged_admin;
		if(ad != '' && ad != undefined){
				console.log(ad);
				var u = administrator.findOne({email: ad},function(err,u){
						if(!err){

							res.render('dashboard',{admin:u});
						}
						else{
							res.send("Loi");
						}
				});
		}
		else{
				res.redirect('/admin/login');
		}
});

app.get('/admin/rich-snippet',function(req,res){
	
	var ad = req.session.logged_admin;
		if(ad != '' && ad != undefined){
				console.log(ad);
				var u = administrator.findOne({email: ad},function(err,u){
						if(!err){

							res.render('create_rich',{admin:u});
						}
						else{
							res.send("Loi");
						}
				});
		}
		else{
				res.redirect('/admin/login');
		}
});




app.get('/admin/blog-category',function(req,res){
	
	var ad = req.session.logged_admin;
		if(ad != '' && ad != undefined){
				console.log(ad);
				var u = administrator.findOne({email: ad},function(err,u){
						if(!err){

							var cat = blog_category.find({},function(er,cat){
									if(!er){
										var rs = req.flash('result')[0];
										res.render('blog_category',{admin:u,category:cat,result: rs });
									}
									else{
										res.send("Lỗi find category");
									}
							});
						}
						else{
							res.send("Loi");
						}
				});
		}
		else{
				res.redirect('/admin/login');
		}
});

app.get('/admin/category',function(req,res){
	
	var ad = req.session.logged_admin;
		if(ad != '' && ad != undefined){
				console.log(ad);
				var u = administrator.findOne({email: ad},function(err,u){
						if(!err){

							var cat = category.find({},function(er,cat){
									if(!er){
										var rs = req.flash('result')[0];
										res.render('category_list',{admin:u,category:cat,result: rs });
									}
									else{
										res.send("Lỗi find category");
									}
							});
						}
						else{
							res.send("Loi");
						}
				});
		}
		else{
				res.redirect('/admin/login');
		}
});

app.get('/admin/product',function(req,res){
		var action = req.query.action;
		var id = req.query.id;
		var ad = req.session.logged_admin;
		if(ad != '' && ad != undefined){

				if(!action){
					var u = administrator.findOne({email: ad},function(err,u){
						if(!err){

							var pro = product.find({},function(er,pro){
									if(!er){
										var cat = category.find({},function(e,cat){
												if(!e){
														res.render('products_list',{admin:u,products:pro,category:cat,result: req.flash('result')});
												}
												else{
													res.send("Lỗi find category");
												}
										});
									}
									else{
										res.send("Lỗi find product");
									}
							});
						}
						else{
							res.send("Loi");
						}
					});
				}
				else if(action == "add"){
					var u = administrator.findOne({email: ad},function(err,u){
						if(!err){

							var cat = category.find({},function(er,cat){
									if(!er){
										res.render('add_product',{admin:u,category:cat});
									}
									else{
										res.send("Loi find category");
									}
							});
						}
						else{
							res.send("Loi");
						}
					});
				}
				else if(action == "edit" && id != undefined){
					
					var u = administrator.findOne({email: ad},function(err,u){
						if(!err){

							var cat = category.find({},function(er,cat){
									if(!er){
										var pro = product.findOne({_id: id},function(e,pro){
												if(!e){
													res.render('edit_product',{admin:u,category:cat,product:pro});
												}
												else{
													res.send("Lỗi find product");
												}
										});
									}
									else{
										res.send("Loi find category");
									}
							});
						}
						else{
							res.send("Loi");
						}
					});
				}
				else{
					res.redirect('/admin/login');
				}
		}
		else{
			res.redirect('/admin/login');
		}
});



app.get('/admin/blog',function(req,res){
		var action = req.query.action;
		var id = req.query.id;
		var ad = req.session.logged_admin;
		if(ad != '' && ad != undefined){

				if(!action){
					var u = administrator.findOne({email: ad},function(err,u){
						if(!err){

							var art = article.find({},function(er,art){
									if(!er){
										var cat = blog_category.find({},function(e,cat){
												if(!e){
														res.render('blog_list',{admin:u,articles:art,category:cat,result: req.flash('result')});
												}
												else{
													res.send("Lỗi find category");
												}
										});
									}
									else{
										res.send("Lỗi find product");
									}
							});
						}
						else{
							res.send("Loi");
						}
					});
				}
				else if(action == "add"){
					var u = administrator.findOne({email: ad},function(err,u){
						if(!err){

							var cat = blog_category.find({},function(er,cat){
									if(!er){
										res.render('add_article',{admin:u,category:cat});
									}
									else{
										res.send("Loi find category");
									}
							});
						}
						else{
							res.send("Loi");
						}
					});
				}
				else if(action == "edit" && id != undefined){
					
					var u = administrator.findOne({email: ad},function(err,u){
						if(!err){

							var cat = blog_category.find({},function(er,cat){
									if(!er){
										var pro = article.findOne({_id: id},function(e,pro){
												if(!e){
													res.render('edit_article',{admin:u,category:cat,article:pro});
												}
												else{
													res.send("Lỗi find product");
												}
										});
									}
									else{
										res.send("Loi find category");
									}
							});
						}
						else{
							res.send("Loi");
						}
					});
				}
				else{
					res.redirect('/admin/login');
				}
		}
		else{
			res.redirect('/admin/login');
		}
});



app.get('/admin/browser', multipartMiddleware, function(req, res) {
		var funcNum = req.query.CKEditorFuncNum;

		var path = __dirname + '/public/uploads/images/';
		
		
		fs.readdir(path, function(err,files){
				if(!err){
					res.render("images_browser",{funcNum:funcNum,images_list: files});
				}
				else{
					console.log("loi");
				}
		});

    	
});




//End ADMIN GET Router



//POST Router
app.post('/category/info',function(req,res){
	var id = req.body.id;
	if(id != undefined){
		var inf = category.findOne({_id: id},function(err,inf){
				if(!err){
					res.send(inf);
				}
				else{
					res.send('fail');
				}
		});
	}
});


app.post('/blog-category/info',function(req,res){
	var id = req.body.id;
	if(id != undefined){
		var inf = blog_category.findOne({_id: id},function(err,inf){
				if(!err){
					res.send(inf);
				}
				else{
					res.send('fail');
				}
		});
	}
});


app.post('/post/seo-research-oponent',function(req,res){
	var url = req.body.url.toString();
	var json = { title : "", release : "", rating : ""};
	

	request(url, function (error, response, html) {
	  console.log('error:', error); // Print the error if one occurred
	  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
	 
	 if(!error){
	 		var $ = cheerio.load(html);
	 		var title = $('title').text();
	 		var description = $('meta[name="description"]').attr('content');
	 		var keywords = $('meta[name="keywords"]').attr('content');
	 		var viewport = $('meta[name="viewport"]').attr('content');
	 			if(viewport != undefined || viewport != ""){
	 				viewport = "Có";
	 			}
	 		var og_description = $('meta[property="og:description"]').attr('content');
	 		var og_title = $('meta[property="og:title"]').attr('content');
	 		var og_url = $('meta[property="og:url"]').attr('content');

	 		var link = $('a');

	 		var link_number = link.length;
	 		var in_link_count = 0;
	 		var ex_link_count = 0;

	 		link.each(function(i, elem) {
	 			var l = $(this).attr("href") + "";
	 		
	 			if(l.includes(url)){
	 				in_link_count += 1;
	 			}

	 		});


	 		var data = {
	 			title: {name:"Tiêu Đề (Title)",value: ""},
	 			description: {name: "Mô Tả (Meta Description)",value: ""},
	 			keywords: { name: "Từ Khóa",value: "" },
	 			og_description: {name: "Mô Tả Đồ Thị Mở(Open Graph Description)",value: ""},
	 			viewport: {name:"Tương Thích Di Động",value: ""},
	 			og_title: {name: "Tiêu Đề OP",value:""},
	 			og_url: { name: "URL OP",value: ""},
	 			link_number: {name: "Tổng Số Link", value: ""},
	 			in_link_count: {name:"Số Link Nội",value: ""}

	 		};

	 		data.in_link_count.value = in_link_count;
	 		data.link_number.value = link_number;
	 		data.viewport.value = viewport;
	 		data.keywords.value = keywords;
	 		data.title.value = title;
	 		data.description.value = description;
	 		data.og_description.value = og_description;
	 		data.og_title.value = og_title;
	 		data.og_url.value = og_url;
	 		console.log();
	 		res.json(data);
	 }
	 else{
	 		res.send("loi roi:"+error);
	 }

	});


});

app.post('/admin/category/add',function(req,res){

	var ad = req.session.logged_admin;

	if(ad != undefined){
	var db = req.body;
		var code = db.code;
		var name = db.name;
		var permalink = db.permalink;
		var parent = db.parent;
		var description = db.description;

			var cat = new category({
				code: code,
				name: name,
				permalink: permalink,
				parent: parent,
				description: description
			});

			cat.save(function(err){
					if(!err){
						req.flash('result', 'ok');
						res.redirect('/admin/category');
					}
					else{
						req.flash('result', 'fail');
						res.redirect('/admin/category');
					}
			});
		
	}
	else{
		res.redirect('/admin/login');
	}
});

app.post('/admin/blog-category/add',function(req,res){

	var ad = req.session.logged_admin;

	if(ad != undefined){
	var db = req.body;
		var code = db.code;
		var name = db.name;
		var permalink = db.permalink;
		var parent = db.parent;
		var description = db.description;

			var cat = new blog_category({
				code: code,
				name: name,
				permalink: permalink,
				parent: parent,
				description: description
			});

			cat.save(function(err){
					if(!err){
						req.flash('result', 'ok');
						res.redirect('/admin/blog-category');
					}
					else{
						req.flash('result', 'fail');
						res.redirect('/admin/blog-category');
					}
			});
		
	}
	else{
		res.redirect('/admin/login');
	}
});


app.post('/admin/category/edit',function(req,res){

	var ad = req.session.logged_admin;

	if(ad != undefined){
	var db = req.body;
		var id = db.edit_id;
		var code = db.edit_code;
		var name = db.edit_name;
		var permalink = db.edit_permalink;
		var parent = db.edit_parent;
		var description = db.edit_description;

			var up = category.update({_id: id},{
				code: code,
				name: name,
				permalink: permalink,
				parent: parent,
				description: description
			}, function(err){
				if(!err){
					req.flash('result', 'ok');
					res.redirect('/admin/category');
				}
				else{
						req.flash('result', 'fail');
						res.redirect('/admin/category');
					}
			});
		
	}
	else{
		res.redirect('/admin/login');
	}
});


app.post('/admin/blog-category/edit',function(req,res){

	var ad = req.session.logged_admin;

	if(ad != undefined){
	var db = req.body;
		var id = db.edit_id;
		var code = db.edit_code;
		var name = db.edit_name;
		var permalink = db.edit_permalink;
		var parent = db.edit_parent;
		var description = db.edit_description;

			var up = blog_category.update({_id: id},{
				code: code,
				name: name,
				permalink: permalink,
				parent: parent,
				description: description
			}, function(err){
				if(!err){
					req.flash('result', 'ok');
					res.redirect('/admin/blog-category');
				}
				else{
						req.flash('result', 'fail');
						res.redirect('/admin/blog-category');
					}
			});
		
	}
	else{
		res.redirect('/admin/login');
	}
});


app.post('/category/remove',function(req,res){
	var ad = req.session.logged_admin;

	if(ad != undefined){
	var id = req.body.id;
		category.remove({_id:id},function(err){
			if(!err){
					
					res.send("ok");
			}
			else{
						
					res.send("fail");
			}
		});
		
	}
	else{
		res.redirect('/admin/login');
	}
});


app.post('/blog/remove',function(req,res){
	var ad = req.session.logged_admin;

	if(ad != undefined){
	var id = req.body.id;
		article.remove({_id:id},function(err){
			if(!err){
					
					res.send("ok");
			}
			else{
						
					res.send("fail");
			}
		});
		
	}
	else{
		res.redirect('/admin/login');
	}
});

app.post('/blog-category/remove',function(req,res){
	var ad = req.session.logged_admin;

	if(ad != undefined){
	var id = req.body.id;
		blog_category.remove({_id:id},function(err){
			if(!err){
					
					res.send("ok");
			}
			else{
						
					res.send("fail");
			}
		});
		
	}
	else{
		res.redirect('/admin/login');
	}
});


app.post('/admin/product/add',upload.single('file'),function(req,res){

	var ad = req.session.logged_admin;

	if(ad != undefined){

			var d = req.body;
				var name = d.name;
				var category = d.category;
				var keywords = d.keywords;
				var description = d.description;
				var price = d.price;
				var sale_price = d.sale_price;
				var code = d.code;
				var amount = d.amount;
				var stock_status = d.stock_status;
				var weight = d.weight;
				var length = d.length;
				var width = d.width;
				var height = d.height;
				var payment_method = d.payment_method;
				var short_description = d.short_description;
			
			var file = req.file;

                  var today = new Date();
                        var dd = today.getDate();
                        var mm = today.getMonth()+1; //January is 0!
                        var yyyy = today.getFullYear();

                        if(dd<10) {
                            dd='0'+dd
                        } 

                        if(mm<10) {
                            mm='0'+mm
                        } 
                        today = mm+'/'+dd+'/'+yyyy;
        var originalname = file.originalname;
                      //  originalname = originalname.replace(".","_")+image_extension;
        var destination = file.destination;

        var filename = file.filename;
        var image = '/uploads/images/'+originalname;

        var pathUpload =__dirname+'/public/uploads/images/' + originalname;

        

                          fs.readFile(file.path, function(err, data) {

                              if(!err) {
                                  fs.writeFile(pathUpload, data, function() {
                                      	var pro = new product({
                                      		name: name,
                                      		category: category,
                                      		keywords: keywords,
                                      		image: image,
                                      		description: description,
                                      		price: price,
                                      		sale_price: sale_price,
                                      		code: code,
                                      		amount: amount,
                                      		stock_status: stock_status,
                                      		weight: weight,
                                      		length: length,
                                      		width: width,
                                      		height: height,
                                      		payment_method: payment_method,
                                      		short_description: short_description
                                      	});

                                      	pro.save(function(er){
                                      		if(!er){
                                      			req.flash('result','ok');
                                      			res.redirect('/admin/product');
                                      		}
                                      		else{
                                      			req.flash('result','fail');
                                      			res.redirect('/admin/product');
                                      		}
                                      	});
                                  });

                                }
                              else{
                                  
                                  res.send("Lỗi")
                              }

                		 });
	}
	else{
		res.redirect('/admin/login');
	}

});



app.post('/admin/blog/add',upload.single('file'),function(req,res){

	var ad = req.session.logged_admin;

	if(ad != undefined){

			var d = req.body;
				var title = d.title;
				var category = d.category;
				var keywords = d.keywords;
				var content = d.content;
				var permalink = d.permalink;
				var view = d.view;
				var format = d.format;
				var rich_snippet = d.rich_snippet;
				var author_id = d.author_id;
				var author_name = d.author_name;
				var short_description = d.short_description;
				var video;
				if(format == "on"){
							video = d.video;
				}
				var file = req.file;

                  var today = new Date();
                        var dd = today.getDate();
                        var mm = today.getMonth()+1; //January is 0!
                        var yyyy = today.getFullYear();

                        if(dd<10) {
                            dd='0'+dd
                        } 

                        if(mm<10) {
                            mm='0'+mm
                        } 
                        today = mm+'/'+dd+'/'+yyyy;
        var originalname = file.originalname;
                      //  originalname = originalname.replace(".","_")+image_extension;
        var destination = file.destination;

        var filename = file.filename;
        var image = '/uploads/images/blog/'+originalname;

        var pathUpload =__dirname+'/public/uploads/images/blog/' + originalname;

        

                          fs.readFile(file.path, function(err, data) {

                              if(!err) {
                                  fs.writeFile(pathUpload, data, function() {
                                      	var pro = new article({
                                      		created_at: today,
                                      		title: title,
                                      		category: category,
                                      		keywords: keywords,
                                      		image: image,
                                      		video: video,
                                      		content: content,
                                      		permalink: permalink,
                                      		view: view,
                                      		rich_snippet: rich_snippet,
                                      		author_id: author_id,
                                      		author_name: author_name,
                                      		short_description: short_description
                                      	});

                                      	pro.save(function(er){
                                      		if(!er){
                                      			req.flash('result','ok');
                                      			res.redirect('/admin/blog');
                                      		}
                                      		else{
                                      			req.flash('result','fail');
                                      			res.redirect('/admin/blog');
                                      		}
                                      	});
                                  });

                                }
                              else{
                                  
                                  res.send("Lỗi")
                              }

                		 });
	}
	else{
		console.log("loi chua dang nhap");
		res.redirect('/admin/login');
	}

});


app.post('/admin/product/edit',upload.single('file'),function(req,res){

	var ad = req.session.logged_admin;

	if(ad != undefined){

			var d = req.body;
				var id = d.id;
				var name = d.name;
				var category = d.category;
				var keywords = d.keywords;
				var description = d.description;
				var price = d.price;
				var sale_price = d.sale_price;
				var code = d.code;
				var amount = d.amount;
				var stock_status = d.stock_status;
				var weight = d.weight;
				var length = d.length;
				var width = d.width;
				var height = d.height;
				var payment_method = d.payment_method;
				var short_description = d.short_description;
		
			var file = req.file;

			  if(file != undefined){

		        var originalname = file.originalname;
		                      
		        var destination = file.destination;

		        var filename = file.filename;
		        var image = '/uploads/images/'+originalname;

		        var pathUpload =__dirname+'/public/uploads/images/' + originalname;

        

                          fs.readFile(file.path, function(err, data) {

                              if(!err) {
                                  fs.writeFile(pathUpload, data, function() {
                                      	
                                     	product.update({_id:id},{
                                      		name: name,
                                      		category: category,
                                      		keywords: keywords,
                                      		image: image,
                                      		description: description,
                                      		price: price,
                                      		sale_price: sale_price,
                                      		code: code,
                                      		amount: amount,
                                      		stock_status: stock_status,
                                      		weight: weight,
                                      		length: length,
                                      		width: width,
                                      		height: height,
                                      		payment_method: payment_method,
                                      		short_description: short_description
                                      	},function(er){
                                      		if(!er){
                                      			req.flash('result','ok');
                                      			res.redirect('/admin/product');
                                      		}
                                      		else{
                                      			req.flash('result','fail');
                                      			res.redirect('/admin/product');
                                      		}	
                                      		
                                      	});

                                  });

                                }
                              else{
                                  
                                  res.send("Lỗi")
                              }

                		 });
			  }
			  else{
			  			
			  			product.update({_id:id},{
                                      		name: name,
                                      		category: category,
                                      		keywords: keywords,
                                      		description: description,
                                      		price: price,
                                      		sale_price: sale_price,
                                      		code: code,
                                      		amount: amount,
                                      		stock_status: stock_status,
                                      		weight: weight,
                                      		length: length,
                                      		width: width,
                                      		height: height,
                                      		payment_method: payment_method,
                                      		short_description: short_description
                                      	},function(er){
                                      		if(!er){
                                      			req.flash('result','ok');
                                      			res.redirect('/admin/product');
                                      		}
                                      		else{
                                      			req.flash('result','fail');
                                      			res.redirect('/admin/product');
                                      		}	
                                      		
                                      	});
			  }

			
	}
	else{
		res.redirect('/admin/login');
	}

});


app.post('/admin/blog/edit',upload.single('file'),function(req,res){

	var ad = req.session.logged_admin;

	if(ad != undefined){

			var d = req.body;
				var id = d.id;
				var title = d.title;
				var category = d.category;
				var keywords = d.keywords;
				var content = d.content;
				var permalink = d.permalink;
				var view = d.view;
				var format = d.format;
				var rich_snippet = d.rich_snippet;
				var author_id = d.author_id;
				var author_name = d.author_name;
				var short_description = d.short_description;
				var video;
				if(format == "on"){
							video = d.video;
				}
				var file = req.file;

                  	if(file != undefined){
                  			var today = new Date();
		                        var dd = today.getDate();
		                        var mm = today.getMonth()+1; //January is 0!
		                        var yyyy = today.getFullYear();

		                        if(dd<10) {
		                            dd='0'+dd
		                        } 

		                        if(mm<10) {
		                            mm='0'+mm
		                        } 
		                        today = mm+'/'+dd+'/'+yyyy;
					        var originalname = file.originalname;
					                      //  originalname = originalname.replace(".","_")+image_extension;
					        var destination = file.destination;

					        var filename = file.filename;
					        var image = '/uploads/images/blog/'+originalname;

					        var pathUpload =__dirname+'/public/uploads/images/blog/' + originalname;

		        

		                          fs.readFile(file.path, function(err, data) {

		                              if(!err) {
		                                  fs.writeFile(pathUpload, data, function() {
		                                      	
		                                      	var up = article.update({_id:id},{
		                                      		created_at: today,
		                                      		title: title,
		                                      		category: category,
		                                      		keywords: keywords,
		                                      		image: image,
		                                      		video: video,
		                                      		content: content,
		                                      		permalink: permalink,
		                                      		view: view,
		                                      		rich_snippet: rich_snippet,
		                                      		author_id: author_id,
		                                      		author_name: author_name,
		                                      		short_description: short_description
		                                      	},function(er){
		                                      			if(!er){
			                                      			req.flash('result','ok');
			                                      			res.redirect('/admin/blog');
			                                      		}
			                                      		else{
			                                      			req.flash('result','fail');
			                                      			res.redirect('/admin/blog');
			                                      		}
		                                      	});
		                                  });

		                                }
		                              else{
		                                  
		                                  res.send("Lỗi")
		                              }

		                		 });
                  	}
                  	else{				
                  					
                  						var up = article.update({_id:id},{
		                                      		created_at: today,
		                                      		title: title,
		                                      		category: category,
		                                      		keywords: keywords,
		                                      		video: video,
		                                      		content: content,
		                                      		permalink: permalink,
		                                      		view: view,
		                                      		rich_snippet: rich_snippet,
		                                      		author_id: author_id,
		                                      		author_name: author_name,
		                                      		short_description: short_description
		                                      	},function(er){
		                                      			if(!er){
			                                      			req.flash('result','ok');
			                                      			res.redirect('/admin/blog');
			                                      		}
			                                      		else{
			                                      			req.flash('result','fail');
			                                      			res.redirect('/admin/blog');
			                                      		}
		                                      	});
                  	}
	}
	else{
		console.log("loi chua dang nhap");
		res.redirect('/admin/login');
	}

});


app.post('/admin/product/delete',function(req,res){
	
	var ad = req.session.logged_admin;

	if(ad != undefined){
	var id = req.body.Id;
		product.remove({_id:id},function(err){
			if(!err){
                	res.send("ok");
                }
             else{
                	res.send("fail");
                }
		});
		
	}
	else{
		res.redirect('/admin/login');
	}
	
});


app.post('/post/product/delete',function(req,res){
	var a = req.body;
	console.log(a);
	res.send("Đã Xóa!");
});


app.post('/post/admin/login',function(req,res){
	var email = req.body.email;
	var password = req.body.password;

	var c = administrator.count({email:email,password:password},function(err,c){
			if(!err){
					if(c == 1){
							req.session.logged_admin = email;
							
							res.redirect('/admin/product');
					}
					else{
							res.redirect('/login/admin');
					}
			}
			else{
				res.send("lỗi");
			}
	});
});


app.post('/post/register',function(req,res){
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;

	var c = admin.count({email:email},function(err,c){
			if(!err){
					if(c == 0){
							var ad = new admin({
								name: name,
								email:email,
								password: password
							});

							ad.save(function(er){
								if(!er){
										res.redirect('product');
								}
							});
					}
					else{
							res.redirect('/register');
					}
			}
			else{
				res.send("Lỗi!");
			}
	});
});


app.post('/admin/uploader', multipartMiddleware, function(req, res) {
    var fs = require('fs');
    console.log(req.files.upload.name);

    fs.readFile(req.files.upload.path, function (err, data) {
        var newPath = __dirname + '/public/uploads/images/' + req.files.upload.name;
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





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = app;
