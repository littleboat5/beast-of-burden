var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    modified: {type:Date, default:Date.now}
});

// Setting up a .pre middleware function 
commentSchema.pre("remove", function(next){  
    // delete any references to this comment from beasts when "remove()" is executed in comment destroy router
    this.model("Beast").update(
        { },
        { "$pull": {"comments": this._id}},
        { "multi": true},
        next
    );
});

module.exports = mongoose.model("Comment", commentSchema);
//the model name "Comment" is used in beast.js as the ref for the comments array 
