var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Log in' });
});

/* GET signup page. */
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Sign up' });
});

/* GET contacts page. */
router.get('/contacts', function(req, res, next) {
  res.render('contacts', { title: 'Contacts' });
});

/* GET team page. */
router.get('/team', function(req, res, next) {
  res.render('team', { title: 'Team' });
});

/* GET profile page. */
router.get('/profile', function(req, res, next) {
  res.render('profile', { title: 'Profile' });
});

module.exports = router;
