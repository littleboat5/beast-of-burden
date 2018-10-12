var mongoose = require("mongoose");  // mongoDB modeling tool


var beastSchema = new mongoose.Schema( {
    region: String,
    type: String,
    name: String,
    location: String,
    lat: Number,
    lng: Number,
    image: String,
    buy: {type:Boolean, default:false},
    rent: {type:Boolean, default:false},
    description: String,
    
    contactId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
    },

    comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"  //the string "Comment" should be the model name exported from comment.js
      }
    ],
    
    reviews: [
        {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Review"  //the string "Review" should be the model name exported fron review.js
        }
    ],
    
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Beast", beastSchema);