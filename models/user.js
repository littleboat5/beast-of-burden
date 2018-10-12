var mongoose = require("mongoose");  // mongoDB modeling tool
var passportLocalMongoose = require("passport-local-mongoose");


var userSchema = new mongoose.Schema( {
    username: String,
    password: String,
    contactname: String,
    phone: String,
    email: String,
    address: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);