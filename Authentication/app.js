const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var pg = require('pg');
var conString = process.env.ELEPHANTSQL_URL || "postgres://vvtvxtci:h4smDLI0EeR6WeorXCHwpsa-lNoj7vcX@horton.elephantsql.com:5432/vvtvxtci";
var client = new pg.Client(conString);
const expressValidator = require('express-validator');
//Init app
const app = express();

//Models
let User = require('./models/user')
app.set('views,', path.join(__dirname,'views'));
app.set('view engine','pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressValidator());
// parse application/json
app.use(bodyParser.json())

//Set Public Folder
app.use(express.static(path.join(__dirname,'public')));
//Database connection
/*
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  else{
    return console.log('Connected to ElephantSQL Database');
  }
});*/
//Home
app.get('/',function(req,res){
  res.render('index');

  client.query('SELECT username AS "username", email as "email" FROM users', function(err, result) {
  if(err) {
    return console.error('error running query', err);
  }
  else{
    for(var i=0;i<result.rows.length;i++)
    {
      console.log(result.rows[i].username+' '+result.rows[i].email);
    }
  }
  //client.end();
  });
});

//route
let users = require('./routes/users');
app.use('/users',users);
/*
//Admin
app.get('/admin',function(req,res){
  User.find({}, function(err, users){
    if(err){
      console.log(err);
    }
    else{
      res.render('admin',{
        username: username
      });
    }
  });
});*/

//Start server
app.listen(3000,function(){
  console.log('Server started on port 3000');
});
