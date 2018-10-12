var express = require("express");
var router = express.Router({mergeParams: true}); //important to set mergeParams so req.params.id can be recognized

var middleware = require("../middleware"); //when requiring a directory, the index.js file in the directory is automatically required
var msg = require("../middleware/messages");

var Beast = require("../models/beast"); 
var Review = require("../models/review");


// "/beasts/:id/reviews" is appended in front of all routes

/******************************************************************/
/****** INDEX route - show all reviews *****/
/******************************************************************/
router.get('/', function(req, res){
    var perPage = 5;  // # of reviews to be displayed per page
    var currPage = req.query.page || 1;  // current page, if none is set, then it is page 1
    var rv = [];
        
    Beast.findById( req.params.id)
         .populate("reviews")
         .exec(function (err, bb){
            if(err){
                req.flash(msg.error.type, err.message);
                return res.redirect('/beasts/'+req.params.id);  
            } 
 
 // Now, get the subset of reviews that belongs to currPage     
            var beginSlice = (currPage-1) * perPage;
            var endSlice = currPage * perPage;
            rv = bb.reviews.slice(beginSlice, endSlice);
            
            res.render('reviews/index', {
                beast: bb,
                reviews: rv, 
                totalPages: Math.ceil(bb.reviews.length / perPage),
                currPage: currPage
            });
    });
});

/******************************************************************/
/****** NEW route - show form to create new review and rating *****/
/******************************************************************/
router.get('/new', middleware.isLoggedIn, function(req, res){
// Only registered users can leave reviews

    Beast.findById( req.params.id, function(err, bb){
        if(err){
            req.flash(msg.error.type, err.message);
            return res.redirect('/beasts');  // go back to /beasts page
        } else {
            res.render('reviews/new', {beastId:req.params.id, beastName:bb.name});
        }
    });
});

/******************************************************************/
/****** CREATE route - Add new review ******/
/******************************************************************/
router.post('/', function(req, res){ // route name of post req must match the form action name on ejs

// must populate reviews so average rating can be calculated
    Beast.findById( req.params.id).populate("reviews").exec(function (err, bb){
        if(err){
            req.flash(msg.error.type, err.message);
            return res.redirect('/beasts/'+req.params.id);  
        } else {
            Review.create(req.body.review, function(err, review){
                if(err){
                    req.flash(msg.reviewCreatefail.type, msg.reviewCreatefail.text);
                    return res.redirect('/beasts/'+req.params.id);  
                } 
                review.author.id = req.user._id;
                review.author.username = req.user.username;
                review.beast = bb._id;
                review.save();
                
                bb.reviews.push(review);
                bb.rating = averageRating(bb.reviews);
                bb.save();
                req.flash(msg.reviewCreateSuccess.type, msg.reviewCreateSuccess.text);
                res.redirect('/beasts/'+bb._id);  
            });
        }             
    });
});

/******************************************************************/
/****** EDIT route - show form to edit review ******/
/******************************************************************/
// router.get('/:review_id/edit', middleware.checkReviewOwnership, function(req, res){ //full route would be "/beast/:id/reviews/:review_id/edit"
router.get('/:review_id/edit', middleware.checkReviewOwnership, function(req, res){ //full route would be "/beast/:id/reviews/:review_id/edit"

// at this point, req.params.id contains the beast ID, review_id (see line above /:review_id) contains the review ID
        Review.findById(req.params.review_id, function(err, foundReview){
            if (err){
                req.flash(msg.error.type, err.message);
                return res.redirect('/beasts/'+req.params.id);  
            } else { 
                Beast.findById( req.params.id, function(err, bb){
                    if(err){
                        req.flash(msg.error.type, err.message);
                        return res.redirect('/beasts/'+req.params.id);  
                    } else {
                        res.render("reviews/edit", {beastId:req.params.id, beastName:bb.name, review: foundReview}); 
                    }
                });
            }
        });        
});

/******************************************************************/
/****** UPDATE route - make update of 1 review in db ******/
/******************************************************************/
router.put('/:review_id', middleware.checkReviewOwnership, function(req, res){
    
    Review.findByIdAndUpdate( req.params.review_id, req.body.rv, {new: true}, function(err, updatedReview){
// {new: bool} - if true, return the modified document rather than the original.
        if(err){
            req.flash(msg.reviewEditfail.type, msg.reviewEditfail.text);
            return res.redirect("/beasts/"+req.params.id);
        } 
        // re-calculate overall rating
        Beast.findById( req.params.id).populate("reviews").exec(function (err, bb){
            if(err){
                req.flash(msg.reviewEditfail.type, msg.reviewEditfail.text);
                return res.redirect("/beasts/"+req.params.id);
            } 
            bb.rating = averageRating(bb.reviews);
            bb.save();
            req.flash(msg.reviewEditSuccess.type, msg.reviewEditSuccess.text);
            res.redirect("/beasts/"+req.params.id);
        });
    });
});

/******************************************************************/
/****** DESTROY route - remove review from db ******/
/******************************************************************/
router.delete('/:review_id', middleware.checkReviewOwnership, function(req, res){

    Review.findById(req.params.review_id, function(err, review){
        if (err || !review){
            req.flash(msg.reviewNotfound.type, msg.reviewNotfound.text);
            return res.redirect("/beasts/"+req.params.id);
        }
        review.remove(); 
// all ref to this review in beast will also be delete. This is achieved by a pre middleware function
// set up in the review model

// now, recalculate the overall rating
        Beast.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, bb) {
        // Beast.findByIdAndUpdate( req.params.id, {new: true}).populate("reviews").exec(function (err, bb){
           if(err){
                console.log(err);
            } else { 
                bb.rating = averageRating(bb.reviews);
                bb.save();
            }
        });
        
        req.flash(msg.reviewDel.type, msg.reviewDel.text);
        res.redirect("/beasts/" + req.params.id);
    });
});

/******************************************************************/
/**** FUNCTIONS ******/
/******************************************************************/

function averageRating( reviews ){

    if (!reviews || reviews.length === 0 ) {
        return 0; // no reviews, rating = 0
    }
    var total = 0;
    
    reviews.forEach( function(rv){
        total += rv.rating;
    });
    
    return total/reviews.length;
}

module.exports = router;