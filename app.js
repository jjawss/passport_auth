var express = require("express");
var app = express();
var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");

mongoose.Promise = global.Promise;
mongoose.connect(
  process.env.MONGODB_URI || `mongodb://localhost:27017/node_auth_demo_app`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

/////SESSION SETUP/////
app.use(
  require("express-session")({
    secret: "This string will be used to decode the information in the session",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize()); //NEED THESE TWO LINES
app.use(passport.session()); //ANYTIME YOU USE PASSPORT

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//====================================================
////////////////////////ROUTES////////////////////////
//====================================================
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/secret", isLoggedIn, (req, res) => {
  res.render("secret");
});

//Auth Routes

//signup logic

//show signup form
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        return res.render("register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secret");
        });
      }
    }
  );
});

//LOGIN

app.get("/login", (req, res) => {
  res.render("login");
});

//LOGIN LOGIC
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

//LOGOUT

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("server started");
});
