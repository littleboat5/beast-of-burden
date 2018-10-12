var mongoose = require("mongoose");  // mongoDB modeling tool
var Beast = require("./models/beast");  // require models/beast.js
var Comment   = require("./models/comment");
var User   = require("./models/user");
 
var data = [
    {region: 'Tibet', type:'yak', name:'randy', buy:false, rent: true, 
        description: 'As has already been mentioned, Tibetan yaks serve a great importance to the Tibetan people, especially the nomads. The yaks serve as the important constituents to earn their livelihoods and carry on with their lives. Not only that, there are many festivals also related with the yaks as a matter of fact, to show its importance. The famous Yak Festival of Tibet, for example, is one such festival that occurs to show the importance of the yaks in the agricultural lives of the Tibetans. In this festival, the yaks are decorated by making them wear colourful clothes, placing colorful beads across neck or tying colorful flags along their horns and so on. This festival occurs in the fifteenth day of the eighth month of the Tibetan calendar.',
        image:'https://images.unsplash.com/photo-1515258124536-ca51b09d5b1d?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=94fa030d6997364ba4797858bff6ed1e&auto=format&fit=crop&w=1050&q=80',
        price:'Rental fee USD80 / day', contact: 'Gyatso@gmail.com'
    },
    {region: 'Pamir', type:'yak', name:'toughboy', buy:false, rent: true, 
        description: 'Toughboy is tough on the outside but soft on the inside. He loves human and loves to be pat.',
        image:'https://images.unsplash.com/photo-1500923100386-c799c70c3f66?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d8d9c5b0f1e5d2b786758f1a9561714c&auto=format&fit=crop&w=634&q=80',
        price:'Rental fee PKR1500 / day', contact: 'Abdul@gmail.com'
    },
    {region: 'Pamir', type:'camel', name:'ladyM', buy:true, rent: true, 
        description: 'LadyM is a classy lady, she loves to look beautiful.',
        image:'https://images.unsplash.com/photo-1508972817144-6f62a84645c4?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=f181bdb256310a3fdb412f4565fafc6c&auto=format&fit=crop&w=1045&q=80',
        price:'Rental fee USD80 / day. If you are interested to buy, please contact me directly.', contact: 'Daniyal@gmail.com'
    },
    {region: 'Mongolia', type:'Stallion', name:'Boss', buy:true, rent: false, 
        description: 'Boss is the natural born leader. His strength and speed is incomparable.',
        image:'https://images.unsplash.com/photo-1470422862902-688c1ae73e86?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=49bb4d4b9b75ec2d7c802bf705e00d42&auto=format&fit=crop&w=633&q=80',
        price:'MNT250000 or best offer', contact: 'Altantsetseg@gmail.com'
    },
    {region: 'Taklamakan', type:'mule', name:'messy', buy:true, rent: true, 
        description: 'Messy may look messy but she is one hard working and enduring beast of burden!',
        image:'https://images.unsplash.com/photo-1492693429561-1c283eb1b2e8?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=a48ce90544794a96507c4797450584a7&auto=format&fit=crop&w=800&q=80',
        price:'Rental fee CNY550 / day. To buy, CNY2500 or best offer', contact: 'Moyanchur@gmail.com'
    },
    ];

function seedDB(){
   //Remove all beasts
    Beast.remove({}, function(err){
        if(err){
            console.log(err);
        }
    });
    
    Comment.remove({}, function(err) {
        if(err){
            console.log(err);
        }
    });        
    
     User.remove({}, function(err) {
        if(err){
            console.log(err);
        }
    });        
   
                     //add a few beasts
    data.forEach(function(seed){
        Beast.create(seed, function(err, beast){
            if(err){
                console.log(err)
            } else {
                //create a comment for each beast
                Comment.create(
                    {
                        text: "This beast is great, except for its smell",
                        author: "Homer"
                    }, function(err, comment){
                        if(err){
                            console.log(err);
                        } else {
                            beast.comments.push(comment);
                            beast.save();
                        }
                    });
                }
            });
        });
    

}



module.exports = seedDB;