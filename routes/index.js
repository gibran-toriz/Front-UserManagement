var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.successMesage = '';
  res.render('index', { title: 'Home', 
    _id: req.session._id,
    firstName: req.session.firstName,
    lastName: req.session.lastName,
    email: req.session.email,});
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  req.session.successMesage = '';
  res.render('login', { title: 'Log in', 
  _id: req.session._id,
  firstName: req.session.firstName,
  lastName: req.session.lastName,
  email: req.session.email,});
});

/* GET signup page. */
router.get('/signup', function(req, res, next) {
  req.session.successMesage = '';
  res.render('signup', { title: 'Sign up',
  _id: req.session._id, 
  firstName: req.session.firstName,
  lastName: req.session.lastName,
  email: req.session.email,});
});

/* GET contacts page. */
router.get('/contacts', function(req, res, next) {  
  req.session.successMesage = '';
  res.render('contacts', { title: 'Contacts', 
  _id: req.session._id,
  firstName: req.session.firstName,
  lastName: req.session.lastName,
  email: req.session.email,});
});

/* GET team page. */
router.get('/team', function(req, res, next) {  
  req.session.successMesage = '';
  res.render('team', { title: 'Team', 
  _id: req.session._id,
  firstName: req.session.firstName,
  lastName: req.session.lastName,
  email: req.session.email,});
});

/* GET profile page. */
router.get('/profile', function(req, res, next) {  
  res.render('profile', { title: 'Profile', 
  _id: req.session._id,
  firstName: req.session.firstName,
  lastName: req.session.lastName,
  email: req.session.email,
  successMesage: req.session.successMesage,});
});

module.exports = router;
