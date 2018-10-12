var express = require("express");
var router = express.Router({mergeParams: true});

var passport = require("passport");
var User = require("../models/user"); 

var msg = require("../middleware/messages");

router.get('/', function(req, res){
    res.render('beasts/landing');
});


/*+++++++++++ routes for User authentication +++++++++++++++++++++++ */

/******* REGISTER route ************/
router.get('/register', function(req, res) {
    res.render('register', {pageName: 'register'});
});

/******* CREATE user route ************/
router.post('/register', function(req, res) {
// the User.register() method comes from the passport-local-mongoose plugin
    User.register( new User({username: req.body.username}),
                    req.body.password,
                    function(err, user){
                        if(err){ 
                            req.flash(msg.error.type, err.message);
                            return res.redirect("back");
                        } 
                        user.contactname = req.body.user.contactname;
                        user.email = req.body.user.email;
                        user.phone = req.body.user.phone;
                        user.address = req.body.user.address;
                        user.save();
                        
                        passport.authenticate("local")(req, res, function(){ //can switch to use "facebook" instead of "local" strategy if so desired 
                           req.flash(msg.registerSuccess.type, msg.registerSuccess.text + user.username);
                           res.redirect("/beasts");
                        });                          
                    });
});

/******* LOGIN user route ************/
router.get('/login', function(req, res) {
//    res.render('login', {error: req.flash()});
// the above flash error comes from function middlewareObj.isLoggedIn. However, in order for the error variable
// be globally available so that header.ejs (which is included in all ejs) can access it; we need to make error
// available via app.use(..) in app.js

    res.render('login', {pageName: 'login'});
});

router.post('/login', 
        passport.authenticate("local", { //<- this is the middleware, executed before the route callback function
            successRedirect: "/beasts",
            failureRedirect: "/login" }),
            
        function(req, res) {
            req.flash(msg.loginSuccess.type, msg.loginSuccess.text);
        });

/******* LOGOUT user route ************/
router.get('/logout', function(req, res) {
    req.logout();
    req.flash(msg.logoutSuccess.type, msg.logoutSuccess.text);
    res.redirect("back");
});


module.exports = router;