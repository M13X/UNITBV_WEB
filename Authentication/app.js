const express = require('express');
const path = require('path');
const config = require('./config/database');
const passport = require('passport');
var bodyParser = require('body-parser');
var pg = require('pg');
//var conString = process.env.ELEPHANTSQL_URL || "postgres://vvtvxtci:h4smDLI0EeR6WeorXCHwpsa-lNoj7vcX@horton.elephantsql.com:5432/vvtvxtci";
var client = new pg.Client(config.database);
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
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

//Express session
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
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

//Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
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
let animals = require('./routes/animals');
app.use('/users', users);
app.use('/animals', animals);

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.status(404).send('Not Found');
});

//Start server
app.listen(3000,function(){
  console.log('Server started on port 3000');
});
