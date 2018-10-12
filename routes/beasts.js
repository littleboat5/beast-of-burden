var express = require("express");
var router = express.Router({mergeParams: true});

var Beast = require("../models/beast");  // require models/beast.js
var Comment = require("../models/comment");  // require models/comment.js
var Review = require("../models/review");  // require models/review.js
var User = require("../models/user");  

var middleware = require("../middleware");
var msg = require("../middleware/messages");

/*** enable google map { ****/
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);
/*** enable google map } ****/


/***********************/
/* appends "/beasts" in front of all the routes  */
/***********************/

/**** INDEX route - show all beasts *****/    
router.get('/', function(req, res){
    var perPage = 6;  // # of beasts to be displayed per page
    var currPage = req.query.page || 1;  // current page, if none is set, then it is page 1

    Beast.find({}) 
        .skip((perPage * currPage) - perPage) // skip ahead depending on which page you are on
        .limit(perPage) // limit to display only the # of beasts allowed
        .exec(function(err, bb) {
            Beast.count().exec(function(err, count) {
// count all items in collection with count(), will use this value to calculate total number of pages
            if (err) console.log(err);
            else {
                res.render('beasts/index', {
                    beasts: bb, 
                    currPage: currPage,
                    totalPages: Math.ceil(count / perPage),
                    pageName: 'beasts'});
            }
        });
    });
});

/****** NEW route - show form to create new beast *****/
router.get('/new', middleware.isLoggedIn, function(req, res){ //full route would be "/beast/new", "/beast" got appended per instruction on app.js
    
// before rendering /beasts/new.ejs, run the middleware function isLoggedIn. The "next" in isLoggedIn 
// refers to the callback function here
// Only registered users can create new beast

    res.render('beasts/new');
});


/****** CREATE route - Add new beast to DB ******/
router.post('/', middleware.isLoggedIn, function(req, res){ // route name of post req must match the form action name on ejs
   // get new beast entry from form and create an entry in db via mongoose model Beast
    var isBuy = false,
        isRent = false;
        
    req.body.buy == 'true' ? isBuy = true : isBuy=false;
    req.body.rent == 'true' ? isRent = true : isRent=false;

    var newbb = {
          region: req.body.region,
          type: req.body.type,
          name: req.body.name, 
          location: req.body.location,
          lat: req.body.lat,
          lng: req.body.lng,
          description: req.body.description, 
          contactId: req.user._id,
          buy:isBuy,
          rent:isRent,
          image:req.body.image
    };

// if location is NOT provided, don't even call the geocoder, just flash a warning
    if ( !req.body.location.length ) {
        Beast.create( newbb, function(err, bb){
            if (err) { // problem with create
                req.flash(msg.error.type, err.message);
                res.redirect('/beasts');  // go back to /beasts page
            } else{ // create successful, beast in DB
                req.flash(msg.noLoc.type, msg.noLoc.text);
                res.redirect('/beasts/'+bb._id);  // go to show beast page
            }
        });
        return;
    }
    
    
// location is provide, now geocode it. The Beast.create MUST be called inside the geocode call back
// function or the geocode info won't be included
    geocoder.geocode(req.body.location, function (err, data) {
        var invalidLoc = false;
        
        if (err || !data.length) {
            invalidLoc = true;
        } else {
            newbb.lat = data[0].latitude;
            newbb.lng = data[0].longitude;
            newbb.location = data[0].formattedAddress;
        }
        
        Beast.create( newbb, function(err, bb){
            if (err) { // problem with create
                req.flash(msg.error.type, err.message);
                res.redirect('/beasts');  // go back to /beasts page
            } else{ // create successful, beast in DB
                if ( invalidLoc ) {
                    req.flash(msg.invalidLoc.type, msg.invalidLoc.text);
                }
                res.redirect('/beasts/'+bb._id);  // go to show beast page
            }
        });
    });

});

/****** SHOW route - display details of one beast ******/

// make sure route /beasts/new is defined before the SHOW route 
router.get('/:id', function(req, res){ //full route would be "/beast/:id"
    
    Beast.findById(req.params.id).populate("reviews").populate(
        {   path: "reviews",
            options: {sort: {updatedAt: -1}} // sort by updatedAt in descending order
        }).exec( function(err, bb){
            
        if (err || !bb ) {
            req.flash(msg.beastNotfound.type, msg.beastNotfound.text);
            return res.redirect("/beasts");
        } else{
            User.findById(bb.contactId, function(err, user) {
                if(err){
                    console.log(err);
                } else {
                    res.render("beasts/show", {beast: bb, contact: user});
                }
            });
            // res.render("beasts/show", {beast: bb});
        }
    });
    
});

/****** EDIT route - show form to edit details of one beast ******/
router.get('/:id/edit', middleware.checkBeastOwnership, function(req, res){ //full route would be "/beast/:id/edit"

        Beast.findById(req.params.id, function(err, bb){
            if (err || !bb ) {
                req.flash(msg.beastNotfound.type, msg.beastNotfound.text);
                return res.redirect("/beasts");
            } else { // found the beast, user is logged in, but is the user the owner of the beast?
                res.render("beasts/edit", {beast: bb});    
            }
        });        
});

/****** UPDATE route - make update of one beast in db ******/
router.put('/:id', middleware.checkBeastOwnership, function(req, res){

// if location is NOT provided, don't even call the geocoder, just flash a warning
    if ( !req.body.bb.location.length ) {
        req.body.bb.lat = 0; //reset the lat/lng if the location is empty
        req.body.bb.lng = 0;
        
        Beast.findByIdAndUpdate( req.params.id, req.body.bb, function(err, updatedBeast){
            if(err){
                req.flash(msg.error.type, err.message);
                res.redirect("/beasts");
            } else {
                req.flash(msg.noLoc.type, msg.noLoc.text);
                res.redirect("/beasts/"+req.params.id);
            }
        });
        return;
    }

// location is provide, now geocode it. The Beast.update MUST be called inside the geocode call back
// function or the geocode info won't be updated
var invalidLoc = false;

    geocoder.geocode({address: req.body.bb.location}, function (err, data) {
        if (err || !data.length) { // not able to find on map
            invalidLoc = true;
        } else {  // geocode successful
            req.body.bb.lat = data[0].latitude;
            req.body.bb.lng = data[0].longitude;
            req.body.bb.location = data[0].formattedAddress;
        }

        Beast.findByIdAndUpdate( req.params.id, req.body.bb, function(err, updatedBeast){
            if(err){
                req.flash(msg.error.type, err.message);
                res.redirect("/beasts");
            } else {
                if ( invalidLoc ) {
                    req.flash(msg.invalidLoc.type, msg.invalidLoc.text);
                }
                res.redirect("/beasts/"+req.params.id);
            }
        });
        
    });
    
});

/****** DESTROY route - remove one beast from db ******/
router.delete('/:id', middleware.checkBeastOwnership, function(req, res){
    // Beast.findByIdAndRemove(req.params.id, function(err){
    //     if (err){
    //         res.redirect("/beasts");
    //     } else {
    //         res.redirect("/beasts");
    //     }
    // } );
    
    Beast.findById(req.params.id, function (err, beast) {
        if (err) {
            res.redirect("/beasts");
        } else {
            // deletes all comments associated with the beast
            Comment.remove({"_id": {$in: beast.comments}}, function (err) {
                if (err) {
                    req.flash(msg.commDelFailBeastNotDel.type, msg.commDelFailBeastNotDel.text);
                    return res.redirect("/beasts/"+req.params.id);
                }
                // deletes all reviews associated with the beast
                Review.remove({"_id": {$in: beast.reviews}}, function (err) {
                    if (err) {
                        req.flash(msg.rvDelFailBeastNotDel.type, msg.rvDelFailBeastNotDel.text);
                        return res.redirect("/beasts/"+req.params.id);
                    }
                    //  delete the beast
                    beast.remove();
                    req.flash(msg.beastDel.type, msg.beastDel.text);
                    res.redirect("/beasts");
                });
            });
        }
    });
});


module.exports = router;