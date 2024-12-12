const express = require('express');
const passport = require('passport');
const GoogleOIDCStrategy = require('passport-google-oidc');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const config = require('./config/config');
const session = require('express-session');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + "/"));



app.use(session({
  secret: 'your-secret-key', // replace with your own secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if your application is served over HTTPS
}));


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

// Middleware to initialize Passport
app.use(passport.initialize());

// Endpoint to initiate authentication
app.get('/login/federated/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback endpoint
//app.get('/auth/google/callback',
const JWTSECRET = process.env.JWT_SECRET || 'jAYsWAMINARAYAN';
app.get(CALLBACK_URL,
  passport.authenticate('google', { session: false }),
  (req, res) => {

    console.log("<<<<<<<<<>>>>>>>>>> /auth/google/callback req.body = "+ JSON.stringify(req.body));
    console.log("<<<<<<<<<>>>>>>>>>> /auth/google/callback req.user = "+ JSON.stringify(req.user));
    // Create JWT
    //const token = jwt.sign({ user: req.user }, JWTSECRET, { expiresIn: '1h' });
    const token = jwt.sign({ user: req.user.emails[0] }, JWTSECRET, { expiresIn: '1h' });

    // Send JWT to the frontend
    //res.json({ token });
    // Redirect to the frontend with the token as a query parameter
    res.redirect(`/smsapp/memberinfo?token=${token}`);
  }
);

// Secure endpoint
app.get('/smsapp/memberinfo', (req, res) => {
  // Middleware to verify JWT
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.send(decoded);
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

