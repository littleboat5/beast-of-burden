// contains all middleware functions
// middleware functions takes 3 params, next refers to the callback function that follows

var Comment = require("../models/comment");
var Beast = require("../models/beast"); 
var Review = require("../models/review"); 
var msg = require("../middleware/messages");
 
var middlewareObj = {}

middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

// the error msg below is put into the flash buffer, which will be used after the page redirects
// in this case, the route /login (found in routes/index.js) needs to pass the msg which is now in the flash 
// buffer to the rendering page, login.ejs. There should then be code in login.ejs (or header.ejs)
// to display the "notlogin" error 
    req.flash(msg.loginNeeded.type, msg.loginNeeded.text);
    
    res.redirect("/login");//if fail to authenticate then go to the login page
}

middlewareObj.checkCommentOwnership = function (req, res, next){
// this middleware function checks the authentication and authorization of the user, see if user is the one
// who creates the comment

    if( req.isAuthenticated() ){ // Is user logged in?
        Comment.findById(req.params.comment_id, function(err, comment){
            if (err || !comment){
                req.flash(msg.commentNotfound.type, msg.commentNotfound.text);
                res.redirect("back");
            } else { // found the comment, user is logged in, but is the user the owner of the comment?
                if( comment.author.id.equals(req.user._id) ){ // can't use === to compare one ID is a string and the other is an object
                    return next();     
                } else {
                    req.flash(msg.wrongUser.type, msg.wrongUser.text);
                    res.redirect("back");
                }
            }
        });        
    } else {
        req.flash(msg.loginNeeded.type, msg.loginNeeded.text);
        res.redirect("back");
    }    
}

middlewareObj.checkReviewOwnership = function (req, res, next){
// this middleware function checks the authentication and authorization of the user, see if user is the one
// who creates the review

    if( req.isAuthenticated() ){ // Is user logged in?
        Review.findById(req.params.review_id, function(err, review){
            if (err || !review){
                req.flash(msg.reviewNotfound.type, msg.reviewNotfound.text);
                res.redirect("back");
            } else { // found the review, user is logged in, but is the user the owner of the review?
                if( review.author.id.equals(req.user._id) ){ // can't use === to compare one ID is a string and the other is an object
                    return next();     
                } else {
                    req.flash(msg.wrongUser.type, msg.wrongUser.text);
                    res.redirect("back");
                }
            }
        });        
    } else {
        req.flash(msg.loginNeeded.type, msg.loginNeeded.text);
        res.redirect("back");
    }    
}

middlewareObj.checkBeastOwnership = function (req, res, next){
// this middleware function checks the authentication and authorization of the user, see if user is the one
// who creates the beast

    if( req.isAuthenticated() ){ // Is user logged in?
        Beast.findById(req.params.id, function(err, bb){
            if (err || !bb ) {
                req.flash(msg.beastNotfound.type, msg.beastNotfound.text);
                res.redirect("/beasts");
            } else { // found the beast, user is logged in, but is the user the owner of the beast?
                if( bb.contactId.equals(req.user._id) ){ // can't use === to compare coz bb.contactId is a string and the req.user._id is an object
                    return next();     
                } else {
                    req.flash(msg.wrongUser.type, msg.wrongUser.text);
                    res.redirect("/beasts");
                }
            }
        });        
    } else {
        req.flash(msg.loginNeeded.type, msg.loginNeeded.text);
        res.redirect("/beasts");
    }    
}

module.exports = middlewareObj;