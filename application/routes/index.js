var express = require('express');
var router = express.Router();
var db = require('../conf/database.js');
const { getRecentPosts, getPostsById, getCommentsForPostById } = require('../middleware/posts.js');

// GET home page.
router.get('/', getRecentPosts, function(req, res, next) {
  res.render('index', {title: "Featured Content", recentPosts: res.locals.recentPosts});
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/registration', function(req, res, next) {
  res.render('registration');
});

router.get('/viewpost/:id(\\d+)', getPostsById, getCommentsForPostById, function(req, res, next) {
  console.log("The video path is:" + res.locals.videoPost[0].video);
  res.render('viewpost', {videoPost: res.locals.videoPost});
});

module.exports = router;
