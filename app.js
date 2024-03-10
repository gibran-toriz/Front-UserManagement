var express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authController = require('./controllers/authController');

var app = express();

// Application setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(session({
  secret: 'UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Use `secure: true` in production with HTTPS
}));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(200);
  }
  next();
});

// Route setup
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Route handlers
app.post('/login', authController.loginHandler);
app.post('/signup', authController.signUpHandler);
app.get('/logout', authController.logoutHandler);
app.post('/update-profile', authController.updateProfileHandler);
app.get('/delete', authController.deleteAccountHandler);
app.get('/', function(req, res) {res.render('index', { firstName: req.session.firstName });});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


