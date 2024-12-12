const express = require('express');
const passport = require('passport');
const GoogleOIDCStrategy = require('passport-google-oidc');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const session = require('express-session');
const router = express.Router();
const config = require('../config/config');
const signupController = require('../controllers/signupController');

const CALLBACK_URL = '/oauth2/redirect/google';
passport.use(new GoogleOIDCStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  },
  function(issuer, profile, cb) {
    // In a real application, you'd probably look up the user in the database
    // For simplicity, we're just using the profile as is
    return cb(null, profile);
  }
));

// Endpoint to initiate authentication. called by UI
router.get('/login/federated/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback endpoint
//app.get('/auth/google/callback',
const JWTSECRET = process.env.JWT_SECRET || 'jAYsWAMINARAYAN';
router.get(CALLBACK_URL,
  passport.authenticate('google', { session: false }),  //TODO what does this authenticate? access token? or final token?
  async function (req, res) {

    console.log("<<<<<<<<<>>>>>>>>>> /auth/google/callback req.body = "+ JSON.stringify(req.body));
    console.log("<<<<<<<<<>>>>>>>>>> /auth/google/callback req.user = "+ JSON.stringify(req.user));

    //TODO: check if user is already in db, if not then add it
    await signupController.register(req, res);
    // Create JWT
    //const token = jwt.sign({ user: req.user }, JWTSECRET, { expiresIn: '1h' });
    const token = jwt.sign({ user: req.user.emails[0] }, config.secret, { expiresIn: '60' });

    // Send JWT to the frontend
    //res.json({ token });
    // Redirect to the frontend with the token as a query parameter
    //res.redirect(`/smsapp/memberinfo?token=${token}`);
    
    // Redirect to the frontend with the token in cookie
    //res.cookie('token', token, { httpOnly: true, secure: false, sameSite : true });// false for dev, true for prod
    
    
    // problem with sending cookie is, with httpOnly: true, angular js code cant read the cookie.
    //res.cookie('token', token, { httpOnly: true });// false for dev, true for prod
    //res.redirect('/app');//index.html

    //res.redirect('/smsapp/memberinfo');
    //res.redirect('/app_ui/home/home.view.html');//closest
    
    //res.redirect('/index.html');

    // Redirect to the frontend with the token in header
    //res.setHeader('authorization', 'Bearer ' + token);
    //res.redirect('/smsapp/memberinfo');

    res.send(`
    <html>
      <body>
        <script>
          // Save the token to localStorage
          localStorage.setItem('jwt', '${token}');
          // Redirect to the Angular app
          window.location.href = '/app';
        </script>
      </body>
    </html>
    `);
  }
);

module.exports = router;