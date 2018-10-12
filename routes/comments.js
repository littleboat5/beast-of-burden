var express = require("express");
var router = express.Router({mergeParams: true}); //important to set mergeParams so req.params.id can be recognized

var middleware = require("../middleware"); //when requiring a directory, the index.js file in the directory is automatically required
var msg = require("../middleware/messages");

var Beast = require("../models/beast"); 
var Comment = require("../models/comment"); 

/*+++++++++++ routes for Comment +++++++++++++++++++++++ */

// "/beasts/:id/comments" is appended in front of all the routes. This comes from app.js

/****** NEW route - show form to create new comment *****/
router.get('/new', middleware.isLoggedIn, function(req, res){
// Only registered users can leave comments

    Beast.findById( req.params.id, function(err, bb){
        if(err){
            console.log(err);
        } else {
//            res.render('comments/new', {beast:bb});
            res.render('comments/new', {beastId:req.params.id, beastName:bb.name});
        }
    });
});


/****** CREATE route - Add new comment, associate the comment to corresponding beast in DB ******/
router.post('/', function(req, res){ // route name of post req must match the form action name on ejs
   // get new comment entry from form and create an entry in db via mongoose model Comment, then associate it with the corresponding beast
    Beast.findById( req.params.id, function(err, bb){
        if(err){
            console.log(err);
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    
                    bb.comments.push(comment);
                    bb.save();
                    res.redirect('/beasts/'+bb._id);  
                }
            });
        }             
    });
});

/****** EDIT route - show form to edit comment ******/
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res){ //full route would be "/beast/:id/comments/:comment_id/edit"


// at this point, req.params.id contains the beast ID, comment_id contains the comment ID
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if (err){
                console.log(err);
            } else { 
                Beast.findById( req.params.id, function(err, bb){
                    if(err){
                        console.log(err);
                    } else {
                        res.render("comments/edit", {beastId:req.params.id, beastName:bb.name, comment: foundComment}); 
                    }
                });
            }
        });        
});

/****** UPDATE route - make update of 1 comment in db ******/
router.put('/:comment_id', middleware.checkCommentOwnership, function(req, res){
    
    var modifiedComm = { text: req.body.comm.text, modified: Date.now() };
    
    Comment.findByIdAndUpdate( req.params.comment_id, modifiedComm, function(err, updatedComment){
        if(err){
            req.flash(msg.error.type, err.message);
            res.redirect("back");
        } else {
            res.redirect("/beasts/"+req.params.id);
        }
    });
});

/****** DESTROY route - remove comment from db ******/
router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res){

    Comment.findById(req.params.comment_id, function(err, comment){
        if (err || !comment){
            req.flash(msg.commentNotfound.type, msg.commentNotfound.text);
            return res.redirect("/beasts/"+req.params.id);
        }
        else{
            comment.remove(); 
// all ref to this comment in beast will also be delete. This is achieved by a pre middleware function
// set up in the comment model
            req.flash(msg.commentDel.type, msg.commentDel.text);
            res.redirect("/beasts/" + req.params.id);
        }
    });

    // Comment.findByIdAndRemove(req.params.comment_id, function(err){
    //     if (err){
    //         res.redirect("/beasts/"+req.params.id);
    //     } else {
    //         req.flash(msg.commentDel.type, msg.commentDel.text);
    //         res.redirect("/beasts/"+req.params.id);
    //     }
    // } );
});



module.exports = router;