var messages = {
    error: {type: "error", text: ""},
    registerSuccess: {type: "success", text: "Welcome to YelpBeast "},
    loginNeeded: {type: "error", text: "You need to be logged in to continue"},
    loginSuccess: {type: "success", text: "You are successfully logged in"},
    logoutSuccess: {type: "success", text: "You are successfully logged out"},
    wrongUser: {type: "error", text: "You are not permitted to do this"},
    commentDel: {type: "success", text: "Comment deleted"},
    beastDel: {type: "success", text: "Beast deleted"},
    beastNotfound: {type: "error", text: "Beast not found"},
    commentNotfound: {type: "error", text: "Comment not found"},
    invalidLoc: {type:"warning", text: "Location provided cannot be found on map" },
    noLoc: {type:"warning", text: "Location missing" },
    reviewCreatefail: {type:"error", text: "Unable to create review" },
    reviewCreateSuccess: {type:"success", text: "You have sucessfully submitted a review" },
    reviewEditfail: {type:"error", text: "Something went wrong, your review changes are not saved" },
    reviewEditSuccess: {type:"success", text: "You have sucessfully updated a review" },
    reviewDel: {type: "success", text: "Review deleted"},
    reviewNotfound: {type: "error", text: "Review not found"},
    rvDelFailBeastNotDel: {type:"error", text: "Problem deleting reviews, beast not deleted"},
    commDelFailBeastNotDel: {type:"error", text: "Problem deleting comments, beast not deleted"}
}

module.exports = messages;