const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
var pg = require('pg');
const config = require('../config/database');
var client = new pg.Client(config.database);
let User = require('../models/user');

router.get('/add',function(req,res){
  res.render('add_animal');
});

router.post('/add', function(req, res){
  const name = req.body.name;
  const type = req.body.type;
  const breed = req.body.breed;
  const birth = req.body.birth;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('type', 'Type is required').notEmpty();
  req.checkBody('breed', 'Breed is required').notEmpty();
  req.checkBody('birth', 'Birth is required').notEmpty();

  let errors = req.validationErrors();

  if(errors){
    console.log("erroare");
    res.render('add',{
      errors:errors
    });
  }else{
    client.connect();
    client.query('INSERT into Animals(name,type,breed,birth) VALUES($1,$2,$3,$4)',[ req.body.name,req.body.type,req.body.breed,req.body.birth],function(err,result){
    if(err){
      console.log('Animal insert error: '+err);
    }
    else{
      console.log('New animal added to database');
      req.flash('success','Animal added to database');
      res.redirect('/');
    }
    client.end();
    });
  }
});

module.exports = router;
