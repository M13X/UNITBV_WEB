const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
var pg = require('pg');
const config = require('../config/database');
var client = new pg.Client(config.database);
const bcrypt = require('bcryptjs');

module.exports = function(passport){
  passport.use(new LocalStrategy(function(username,password,done){
    //Match username
    client.connect();
    client.query('SELECT * FROM users WHERE username = $1',[username], function(err, result) {
      console.log('Debug: '+username+' '+password);
      if(err) {
        client.end();
        return console.error('error running query', err);
      }
      else if (result.rows.length!=0){
        console.log("Found");
      }
      else{
        client.end();
        return done(null,false,{message:'Username or password incorrect'});
      }
    });

    //Match password
    client.query('SELECT id AS id, password AS password FROM users WHERE username = $1',[username], function(err, result) {
      if(err) {
        client.end();
        return console.error('error running query', err);
      }
      if(result.rows.length!=0){
        bcrypt.compare(password,result.rows[0].password,function(err,isMatch){
          if(err) throw err;
          if(isMatch){
            console.log('Match');
            let user = new User();
            user.id=result.rows[0].id;
            user.username=username;
            user.password=password;
            client.end();
            return done(null,user);
          } else {
            client.end();
            return done(null,false,{message:'Username or password incorrect'});
          }
        });
      }else{
        client.end();
        return done(null,false,{message:'Username or password incorrect'});
      }
      client.end();
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    //client.connect();
    client.query('SELECT username AS username, password AS password FROM users WHERE = $1',[id], function(err, result2) {
      console.log(result2.rows[0].username);
      if(result.rows.length!=0){
        console.log('hh');
        let user = new User();
        user.id=id;
        user.username=result.rows[0].username;
        user.password=result.rows[0].password;
        done(err,user);
      }
    });
    /*
    User.findById(id, function(err, User) {
      done(err, User);
    });*/
  });
}
