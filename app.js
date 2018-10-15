require('dotenv').config();

var express = require("express");
var app = express();
var bodyParser = require("body-parser"); //so we can use req.body in the POST route
var mongoose = require("mongoose");  // mongoDB modeling tool
var User = require("./models/user");  // look for user.js
var methodOverride = require("method-override");
var flash = require("connect-flash");

/*===============  authentication specific code =============== */
var passport = require("passport"); 
var localStrategy = require("passport-local"); 
/*===============  end authentication related code =============== */

mongoose.connect(process.env.DATABASEURL);
//mongodb://localhost:27017/yelp_beast2
//mongodb://admin:beast1@ds045507.mlab.com:45507/yelpbeast

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public")); //so the server also serves the public dir where app.css is
app.use(methodOverride("_method")); //for use in PUT vs POST route methods
app.use(flash()); // must come before the passport config
app.set("view engine", "ejs"); //use files with extension '.ejs', so we don't have to type out the entire file name


/*=============== passport configuration =============== */
app.use(require("express-session")({  //<- this must come before all the passport code
    secret: "whatever is done is done",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize()); 
app.use(passport.session()); 

passport.use(new localStrategy(User.authenticate())); // use "local" strategy (vs. using facebook, twitter etc...)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// create a middleware function to be called in every route functions. 
app.use( function(req, res, next){
// make the user info available in every ejs so you don't need to pass "{currUser: req.user}"
// thru every single call to res.render(...) . currUser is used in header.ejs
    res.locals.currUser = req.user;
    
// make the flash messages (error, success, warning) available in every ejs so header.ejs can show them
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    next();
});
/*===============  end passport configuration =============== */

/*========= requring routes js files ===========*/
var commentRoutes    = require("./routes/comments"),
    beastRoutes = require("./routes/beasts"),
    indexRoutes      = require("./routes/index"),
    reviewRoutes      = require("./routes/reviews")


var seedDB = require("./seeds");  // require seeds.js

//seedDB(); // fill the DB with seed data


/*======= include the routes codes ==========*/
app.use("/", indexRoutes); //appends "/" in front of the routes in index.js
app.use("/beasts", beastRoutes); //appends "/beasts" in front of the routes specified in beasts.js
app.use("/beasts/:id/comments", commentRoutes);
app.use("/beasts/:id/reviews", reviewRoutes);



/* tell express to listen for requests (start server) */
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Yelp Beast app started!");
});