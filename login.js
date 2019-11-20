var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'demouser',
	password : 'demopassword',
	database : 'fabricmondetest'
});

connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn");
}
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

var product_data;

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				
				connection.query('SELECT * FROM mytable', function(error, res) {
					if (error) {
						throw error;
					} else {
						product_data = res;
						response.render('pages/userhome', {product_data: product_data});
						response.end();
					}
				});
			} else {
				response.send('Incorrect Username and/or Password!');
			}
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/save',(request, response) => {
	let data = {product_id: request.body.product_id, product_name: request.body.product_name, composition: request.body.composition, color: request.body.color};
	let sql = "INSERT INTO mytable SET ?";
	let query = connection.query(sql, data,(err, results) => {
	  if(err) throw err;
	  connection.query('SELECT * FROM mytable', function(error, res) {
		if (error) {
			throw error;
		} else {
			product_data = res;
			response.render('pages/userhome', {product_data: product_data});
			response.end();
		}
	});
	});
});

app.post('/update',(request, response) => {
	let sql = "UPDATE mytable SET Composition='"+request.body.composition+"', Color='"+request.body.color+"' WHERE Product_Name='"+request.body.product_name+"'";
	let query = connection.query(sql, (err, results) => {
	  if(err) throw err;
	  connection.query('SELECT * FROM mytable', function(error, res) {
			if (error) {
				throw error;
			} else {
				product_data = res;
				response.render('pages/userhome', {product_data: product_data});
				response.end();
			}
		});
	});
});

app.post('/delete',(request, response) => {
	let sql = "DELETE FROM mytable WHERE Product_Name='"+request.body.product_name+"'";
	let query = connection.query(sql, (err, results) => {
	  if(err) throw err;
	  connection.query('SELECT * FROM mytable', function(error, res) {
		if (error) {
			throw error;
		} else {
			product_data = res;
			response.render('pages/userhome', {product_data: product_data});
			response.end();
		}
	});
	});
});

app.post('/order_screen',(request, response) => {
	connection.query('SELECT * FROM product_orders', function(error, res) {
		if (error) {
			throw error;
		} else {
			product_data = res;
			response.render('pages/ordermanagementscreen', {product_data: product_data});
			response.end();
		}
	});
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.listen(3000);
