var session = require('express-session');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var flash = require('connect-flash');

var app = express();
var apiUrl = process.env.API_BASE_URL;

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Set CORS headers here if you're handling pre-flight manually
    res.setHeader('Access-Control-Allow-Origin', '*'); // Or a specific origin
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(200); // Short-circuit pre-flight request
  }
  next();
});

app.use(flash());

app.use(session({
  secret: 'UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // `secure: true` en producción si estás usando HTTPS
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Route handlers

var axios = require('axios'); 
var jwt = require('jsonwebtoken');

app.post('/login', function(req, res) {

  axios.post(`${apiUrl}auth/login`, req.body)
  .then(function(response) {      
      var decodedToken = jwt.decode(response.data.accessToken);
      var sub = decodedToken.sub; // Subject (typically user id)
      var firstName = decodedToken.firstName; // Assuming firstName is part of the token payload    
      // Saving information in session
      req.session.sub = sub;      
      req.session.accessToken = response.data.accessToken;
      // Make another request to a different endpoint
      return axios.get(`${apiUrl}users/${sub}`, {
        headers: {
          'Authorization': `Bearer ${ response.data.accessToken }`
        }
      });                           
  }).then(function (response) {      
      req.session.firstName = response.data.firstName;
      req.session.lastName = response.data.lastName;
      req.session.email = response.data.email;
      req.session._id = response.data._id;           
      req.session.save(function(err) {        
        if (err) {
          console.error(err);          
        } else {
          res.redirect('/');
        }
      });
  })
  .catch(function(error) {
      console.log("Response Error API:", error.message);
      res.render('login', { errorMessage: 'Invalid email or password.' });      
  });
});


app.post('/signup', function(req, res) {
  var userId = req.session._id; 
  var { email, firstName, lastName, password } = req.body;  
  var newUser = { email, firstName, lastName, password };   
  console.log('newUser:', newUser); 
  axios.post(`${apiUrl}users/register`, newUser, {
    headers: {
      'Content-Type': 'application/json' 
    }
  })
  .then(function(response) {      
    res.redirect('/login');      
  })
  .catch(function(error) {
      console.log("Response Error API:", error.response.data.message);       
      res.render('signup', { errorMessage: error.response.data.message });      
  });
});

app.get('/', function(req, res) {
  res.render('index', { firstName: req.session.firstName });
});


app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
      if(err) {
          console.log(err);
          res.send("Session could not be destroyed.");
      } else {
          res.redirect('/login');
      }
  });
});


app.post('/update-profile', async function(req, res, next) {
  try {    
    var userId = req.session._id; 
    var { firstName, lastName, password } = req.body;
    var updateData = { firstName, lastName };    
    if (password && password.trim() !== '') {
      updateData.password = password;
    }    
    axios.put(`${apiUrl}users/${userId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${ req.session.accessToken }`
      }
    }).then(function(response) {             
      req.session.firstName = response.data.firstName;
      req.session.lastName = response.data.lastName;  
      req.session.successMesage = 'Ok! Profile updated.';
      res.redirect('/profile');
    }).catch(function(error) {
      console.log("Response Error API:", error.message);      
      req.session.successMesage = 'Failed to update profile.';
      res.redirect('/profile');
    });    
  } catch (error) {
    console.error('Failed to update user data:', error);
    res.render('profile', { errorMessage: 'Failed to update profile.', userData: req.body });
  }
});

app.get('/delete', function(req, res) {
  var userId = req.session._id;
  axios.delete(`${apiUrl}users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${ req.session.accessToken }`
      }
    }).then(function(response) {             
      req.session.destroy(function(err) {
        if(err) {
            console.log(err);
            res.send("Session could not be destroyed.");
        } else {
            res.redirect('/login');
        }
        });      
    }).catch(function(error) {
      console.log("Response Error API:", error.message);      
      req.session.successMesage = error.message;
      res.redirect('/profile');
    });      
});




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
