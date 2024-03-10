var axios = require('axios');
var https = require('https');
var jwt = require('jsonwebtoken');
var apiUrl = process.env.API_BASE_URL;

// Axios instance for handling self-signed certificates
var axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });

exports.loginHandler = function loginHandler(req, res) {
    // Login logic
    axiosInstance.post(`${apiUrl}auth/login`, req.body)
    .then(function(response) {      
        var decodedToken = jwt.decode(response.data.accessToken);
        var sub = decodedToken.sub; // Subject (typically user id)
        var firstName = decodedToken.firstName; // Assuming firstName is part of the token payload    
        // Saving information in session
        req.session.sub = sub;      
        req.session.accessToken = response.data.accessToken;
        // Make another request to a different endpoint
        return axiosInstance.get(`${apiUrl}users/${sub}`, {
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
  }
  
  exports.signUpHandler = function signUpHandler(req, res) {
    // Signup logic
    var userId = req.session._id; 
    var { email, firstName, lastName, password } = req.body;  
    var newUser = { email, firstName, lastName, password };   
    console.log('newUser:', newUser); 
    axiosInstance.post(`${apiUrl}users/register`, newUser, {
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
  }
  
  exports.logoutHandler = function logoutHandler(req, res) {
    // Logout logic
    req.session.destroy(function(err) {
      if(err) {
          console.log(err);
          res.send("Session could not be destroyed.");
      } else {
          res.redirect('/login');
      }
  });
  }
  
  exports.updateProfileHandler = function updateProfileHandler(req, res, next) {
    // Update profile logic
    try {    
      var userId = req.session._id; 
      var { firstName, lastName, password } = req.body;
      var updateData = { firstName, lastName };    
      if (password && password.trim() !== '') {
        updateData.password = password;
      }    
      axiosInstance.put(`${apiUrl}users/${userId}`, updateData, {
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
  }
  
  exports.deleteAccountHandler = function deleteAccountHandler(req, res) {
    // Delete account logic
    var userId = req.session._id;
    axiosInstance.delete(`${apiUrl}users/${userId}`, {
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
  }