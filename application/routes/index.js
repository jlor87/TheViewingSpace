var express = require('express');
var router = express.Router();

// GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CSC 317 App', name:"Joshua Lor" });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/postvideo', function(req, res, next) {
  if(loggedIn){
    res.render('postvideo');
  }
  else {
    return res.redirect('/login');
  }
});

router.get('/profile', function(req, res, next) {
  if(loggedIn){
    res.render('profile', {username: loginUsername, email: loginEmail});
  }
  else return res.redirect('/login');
});

router.get('/registration', function(req, res, next) {
  res.render('registration');
});

router.get('/viewpost', function(req, res, next) {
  res.render('viewpost');
});

router.get('/logout', function(req, res, next) {
  console.log('get request from index.js for /logout');
  loggedIn = false;
  return res.redirect('/');
});

module.exports = router;
