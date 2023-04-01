const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require("cors");
const dotenv = require("dotenv");
const User = require("./models/user");
require("./auth");

dotenv.config();

const app = express();

// Connect to MongoDB database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Set up CORS
app.use(cors());

// Set up Passport
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       // Save user info to database
//       try {
//         const user = await User.findOne({ googleId: profile.id });
//         if (user) {
//           done(null, user);
//         } else {
//           const newUser = new User({
//             googleId: profile.id,
//             displayName: profile.displayName,
//             email: profile.emails[0].value,
//           });
//           await newUser.save();
//           done(null, newUser);
//         }
//       } catch (err) {
//         done(err);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });

// Set up routes

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
// app.use(passport.session)
// app.use(passport.initialize);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/auth/protected");
  }
);

app.get("/auth/protected", isLoggedIn, (req, res) => {
  let name = req.user.displayName;
  res.send("Hello there" + name);
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("app is running on " + port));
