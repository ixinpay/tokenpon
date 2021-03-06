var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var mongo = require("mongoose");
const https = require('https')
const fs = require('fs')
const TokenponAppId = 1
const ChainpostAppId = 2
// Read our configure file
const config = JSON.parse(fs.readFileSync('.configure.json'));

    // The chain page url
    //var gChainPageUrl = "http://localhost:4200";
var gChainPageUrl = config.tokenpon.pageUrl;
// Change the port in "mongo.service.ts" under src/app/_services
// rebuild $ng serve
var gPort = config.tokenpon.serverPort;
var gDbServer = 'localhost';
var httpsRun = config.tokenpon.httpsRun;

var prearg = "";
process.argv.forEach(function(val, index, array) {
        //console.log(`prearg = ${prearg}, val = ${val}`);
        if (/^(-{1,2}port)$/.test(prearg) && !isNaN(val))
            gPort = parseInt(val);
        else if (/^(-{1,2}chainpageurl)$/.test(prearg) && val)
            gChainPageUrl = val;
        else if (/^(-{1,2}dbserver)$/.test(prearg) && val)
            gDbServer = val;
        else if (/^(-{1,2}https)$/.test(val))
            httpsRun = true;

        prearg = val.toLowerCase();
    })
    //console.log(`chainPageSite = ${gChainPageSite}`)
    //console.log(`port = ${gPort}`)
    //console.log(`dbServer = ${gDbServer}`)

//var db = mongo.connect(`mongodb://${gDbServer}:27017/ChainPage`, function(err, response) {
var db = mongo.connect(`mongodb://${gDbServer}:27017/ixinpay`, function(err, response) {
    // if (err) { console.log(err); } else { console.log('Connected to ' + db, ' + ', response); }
});


var app = express()
    //app.use(bodyParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Origin', gChainPageUrl);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var Schema = mongo.Schema;
var CommentSchema = new Schema({
    comment: { type: String },
    postedBy: { type: String },
    postedTime: { type: Number }
});
var VoteSchema = new Schema({
    vote: { type: String },
    postedBy: { type: String },
    postedTime: { type: Number }
});
var DiscountSchema = new Schema({
    amount: { type: Number },
    discount: { type: Number },
    token: { type: Number },
    address: { type: String},
    title: { type: String},
    description: { type: String},
    groupCount: { type: Number },
    expirationDate: { type: Date }
})
var TokenponSchema = new Schema({
    name: { type: String },
    merchantAccountAddress: { type: String},
    merchantId: { type: String },
    businessName: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
    email: { type: String },
    phone: { type: String },
    webPage: { type: String },
    service: { type: String },
    servicingArea: { type: String },
    businessHour: { type: String },
    businessMainCategory: { type: String },
    businessSubCategory: { type: String },
    postedBy: { type: String },
    postedTime: { type: Number },
    comments: [CommentSchema],
    votes: [VoteSchema],
    discounts: [DiscountSchema],
    pictures: [String],
    viewCount: { type: Number },
    region: { type: String },
    notification: { type: Boolean},
    overallTitle: { type: String},
    productDescription: { type: String},
    finePrint: { type: String}
});
var TokenponProfileSchema = new Schema({
    userId: { type: String},
    accountAddress: { type: String},
    accountType: { type: String},
    name: { type: String },
    businessName: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
    email: { type: String },
    phone: { type: String },
    webPage: { type: String },
    service: { type: String },
    servicingArea: { type: String },
    businessHour: { type: String },
    businessMainCategory: { type: String },
    businessSubCategory: { type: String },
    postedBy: { type: String },
    postedTime: { type: Number },
    comments: [CommentSchema],
    votes: [VoteSchema],
    pictures: [String],
    region: { type: String },
    notification: { type: Boolean}
});
// TokenponProfileSchema.index({name: 'text', businessName: 'text',
// street: 'text', city: 'text', state: 'text', zip: 'text',
// country: 'text', email: 'text', service: 'text', servicingArea: 'text',
// businessMainCategory: 'text', businessSubCategory: 'text',
// service: 'text', servicingArea: 'text'
// });
TokenponSchema.index({ '$**': 'text' });

var ChainPostSchema = new Schema({
    Title: { type: String },
    Channel: { type: String },
    Narrative: { type: String },
    formType: { type: String },
    Tags: [String],
    //data example for tags: ["goods","services"]
    postedBy: { type: String },
    postedTime: { type: Number },
    pictures: [String],
    viewCount: { type: Number },
    comments: [CommentSchema],
    votes: [VoteSchema],
    notification: { type: Boolean}
});
ChainPostSchema.index({ Tags: 'text' });

const userExtSchema = new Schema({  // user extended structure
    userId: { type: String },  // user id from user._id
    gender: { type: String },  // gendar: "M", "F", "U"
    dob:    { type: String },  // Date of birth: YYYY-MM-DD
    icon:   { type: String },   // user icon
    displayName: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    aboutme: { type: String }
});

var modelTokenpon = mongo.model('tokenpon', TokenponSchema);
var modelTokenponProfile = mongo.model('tokenponProfile', TokenponProfileSchema);
var modelChainPost = mongo.model('Post', ChainPostSchema);
const modelUserExt = mongo.model('userExt', userExtSchema);

app.get("/api/getProfile/:userId/:appId", function(req, res) {
    var model;
    if (req.params.appId == TokenponAppId) {
        model = modelTokenponProfile;
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.findOne({ userId: req.params.userId }, function(err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
})
app.post("/api/saveProfile", function(req, res) {
    //var mod = new modelTokenponProfile(req.body);
    var model;
    if (req.body.appId == TokenponAppId) {
        model = new modelTokenponProfile(req.body);
    } else if (req.body.appId == ChainpostAppId) {
        model = new modelChainPost(req.body);
        console.log("====model====:" + model);
    }

    model.save(function(err, data) {
        if (err) {
            res.send(err);
        } else {
            console.log(data._id)
            res.send(data._id);
        }
    });
})

app.post("/api/updateProfile", function(req, res) {
    //var mod = new model(req.body);
    console.log("update address: " + req.body.accountAddress)
    var model;
    //console.log(req.body)
    if (req.body.appId == TokenponAppId) {
        model = modelTokenponProfile;
        if (typeof req.body.userId == 'object')
           req.body.userId = req.body.userId.toString();

        //model.update({ _id: req.body._id }, {
        model.updateOne({ userId: req.body.userId }, {
                "$set": {
                    userId: req.body.userId,
                    name: req.body.name,
                    accountAddress: req.body.accountAddress,
                    accountType: req.body.accountType,
                    businessName: req.body.businessName,
                    street: req.body.street,
                    city: req.body.city,
                    state: req.body.state,
                    zip: req.body.zip,
                    country: req.body.country,
                    email: req.body.email,
                    phone: req.body.phone,
                    webPage: req.body.webPage,
                    service: req.body.service,
                    servicingArea: req.body.servicingArea,
                    businessHour: req.body.businessHour,
                    businessMainCategory: req.body.businessMainCategory,
                    businessSubCategory: req.body.businessSubCategory,
                    postedBy: req.body.postedBy,
                    postedTime: req.body.postedTime,
                    pictures: req.body.pictures,
                    notification: req.body.notification
                }
            }, { upsert: true },
            function(err) {
                if (err) {
                    res.send(err);
                    console.log(err);
                } else {
                    // console.log(data)
                    res.send({ data: "Record has been updated..!!" });
                }
            });
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
        model.update({ _id: req.body._id }, {
                "$set": {
                    Title: req.body.Title,
                    Channel: req.body.Channel,
                    Narrative: req.body.Narrative,
                    formType: req.body.formType,
                    Tags: req.body.Tags,
                    postedBy: req.body.postedBy,
                    postedTime: req.body.postedTime,
                    pictures: req.body.pictures,
                    notification: req.body.notification
                }
            }, { upsert: true },
            function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ data: "Record has been updated..!!" });
                }
            });
    }

})
app.post("/api/saveListing", function(req, res) {
    //var mod = new modelChainPage(req.body);
    var model;
    console.log(req.body)
    if (req.body.appId == TokenponAppId) {
        model = new modelTokenpon(req.body);
    } else if (req.body.appId == ChainpostAppId) {
        model = new modelChainPost(req.body);
        console.log("====model====:" + model);
    }

    model.save(function(err, data) {
        if (err) {
            res.send(err);
        } else {
            console.log(data._id)
            res.send(data._id);
        }
    });
})
app.post("/api/updateListing", function(req, res) {
    //var mod = new model(req.body);
    // console.log(req.body._id)
    var model;
    if (req.body.appId == TokenponAppId) {
        model = modelTokenpon;
        model.update({ _id: req.body._id }, {
                "$set": {
                    name: req.body.name,
                    merchantAccountAddress: req.body.merchantAccountAddress,
                    businessName: req.body.businessName,
                    street: req.body.street,
                    city: req.body.city,
                    state: req.body.state,
                    zip: req.body.zip,
                    country: req.body.country,
                    email: req.body.email,
                    phone: req.body.phone,
                    webPage: req.body.webPage,
                    service: req.body.service,
                    servicingArea: req.body.servicingArea,
                    businessHour: req.body.businessHour,
                    businessMainCategory: req.body.businessMainCategory,
                    businessSubCategory: req.body.businessSubCategory,
                    postedBy: req.body.postedBy,
                    postedTime: req.body.postedTime,
                    pictures: req.body.pictures,
                    notification: req.body.notification,
                    discounts: req.body.discounts,
                    productDescription: req.body.productDescription,
                    overallTitle: req.body.overallTitle,
                    finePrint: req.body.finePrint
                }
            }, { upsert: true },
            function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ data: "Record has been updated..!!" });
                }
            });
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
        model.update({ _id: req.body._id }, {
                "$set": {
                    Title: req.body.Title,
                    Channel: req.body.Channel,
                    Narrative: req.body.Narrative,
                    formType: req.body.formType,
                    Tags: req.body.Tags,
                    postedBy: req.body.postedBy,
                    postedTime: req.body.postedTime,
                    pictures: req.body.pictures,
                    notification: req.body.notification
                }
            }, { upsert: true },
            function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ data: "Record has been updated..!!" });
                }
            });
    }

})

app.post("/api/deleteListing", function(req, res) {
    console.log("ID to be deleted: " + req.body.id)
    var model;
    if (req.body.appId == TokenponAppId) {
        model = modelTokenpon;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.deleteOne({ _id: req.body.id }, function(err) {
        if (err) {
            res.send(err);
        } else {
            res.send({ data: "Record has been Deleted..!!" });
        }
    });
})

app.get("/api/getListings/:appId", function(req, res) {
    // console.log(req.params.appId)
    var model;
    var filter = {};
    if (req.params.appId == TokenponAppId) {
        model = modelTokenpon;
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
        filter = { Narrative: 0 };
    }
    model.find({}, filter, function(err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
})

app.get("/api/getListingsByCat/:cat/:appId", function(req, res) {
    var model;
    if (req.params.appId == TokenponAppId) {
        model = modelTokenpon;
        model.find({ businessMainCategory: req.params.cat }, function(err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
        model.find({ Channel: req.params.cat }, function(err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    }

})

app.get("/api/getListingsBySubcat/:subcat/:appId", function(req, res) {
    var model;
    if (req.params.appId == TokenponAppId) {
        model = modelTokenpon;
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.find({ businessSubCategory: req.params.subcat }, function(err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
})

app.get("/api/getListing/:id/:appId", function(req, res) {
    var model;
    if (req.params.appId == TokenponAppId) {
        model = modelTokenpon;
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    console.log("getListing id: " + req.params.id)
    model.findOne({ _id: req.params.id }, function(err, data) {
        if (err) {
            res.send(err);
        } else {
            console.log(data)
            res.send(data);
        }
    });
})
app.get("/api/getViewCount/:id/:appId", function(req, res) {
    var model;
    if (req.params.appId == TokenponAppId) {
        model = modelTokenpon;
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.findOne({ _id: req.params.id }, function(err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
})
app.post("/api/incrementViewCount", function(req, res) {
    console.log("record id: " + req.body.id)
    var model;
    if (req.body.appId == TokenponAppId) {
        model = modelTokenpon;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.update({ _id: req.body.id }, {
            "$inc": {
                "viewCount": 1
            }
        }, { upsert: true },
        function(err) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "View count has been incremented..!!" });
            }
        });
})
app.post("/api/addComment", function(req, res) {
    console.log(req.body)
    var model;
    if (req.body.appId == TokenponAppId) {
        model = modelTokenpon;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.update({ _id: req.body._id }, {
        "$push": {
            "comments": req.body.comment
        }
    }, function(err) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            // console.log(data);
            res.send({ data: "Comment has been inserted..!!" });
        }
    });
})

app.post("/api/updateComment", function(req, res) {
    var model;
    if (req.body.appId == TokenponAppId) {
        model = modelTokenpon;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.update({ _id: req.body._id, "comments._id": req.body.comment._id }, {
        "$set": {
            "comments.$.comment": req.body.comment.comment,
            "comments.$.postedTime": req.body.comment.postedTime
        }
    }, function(err) {
        if (err) {
            res.send(err);
        } else {
            res.send({ data: "Comment has been updated..!!" });
        }
    });
})
app.post("/api/deleteComment", function(req, res) {
    var model;
    if (req.body.appId == TokenponAppId) {
        model = modelTokenpon;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.findOneAndUpdate({ "comments._id": req.body.comment._id }, {
            "$pull": {
                "comments": { _id: req.body.comment._id }
            }
        }, { new: true },
        function(err) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Comment has been deleted..!!" });
            }
        });
})
app.post("/api/addVote", function(req, res) {
    console.log(req.body)
    var model;
    if (req.body.appId == TokenponAppId) {
        model = modelTokenpon;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.update({ _id: req.body._id }, {
        "$push": {
            "votes": req.body.vote
        }
    }, function(err) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            // console.log(data);
            res.send({ data: "Vote has been inserted..!!" });
        }
    });
})
app.post("/api/deleteVote", function(req, res) {
    var model;
    if (req.body.appId == TokenponAppId) {
        model = modelTokenpon;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.findOneAndUpdate({ "votes._id": req.body.vote._id }, {
            "$pull": {
                "votes": { _id: req.body.vote._id }
            }
        }, { new: true },
        function(err) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Vote has been deleted..!!" });
            }
        });
})

app.get("/api/searchListings/:searchtext/:appId", function(req, res) {
    var model;
    console.log(req.params.searchtext + "" + req.params.appId)
    if (req.params.appId == TokenponAppId) {
        model = modelTokenpon;
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.find({ $text: { $search: req.params.searchtext } },
        function(err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
})

/**
 * get the user extend by id
 */
app.get("/api/userExt/:id", function(req, res){
  modelUserExt.findOne({userId: req.params.id}, function(err, foundUserExt){
    if(err){
      res.send(err);
    }else{
      console.log(foundUserExt);
      res.send(foundUserExt);
    }
  })
})

/**
 * if user exists, update
 * otherwise, post new user extend
 */
app.post("/api/userExt", function(req, res){
    const {userId,gender,dob,icon,displayName,city,state,country,aboutme} = req.body;
    var newUserExt = {
        userId: userId,
        gender: gender,
        dob: dob,
        icon: icon,
        displayName: displayName,
        city: city,
        state: state,
        country: country,
        aboutme: aboutme
    };
    modelUserExt.findOneAndUpdate({userId: userId}, {$set: newUserExt}, {upsert: true}, function(err, updatedData){
       if (err){
          res.send(err);
       }else{
          res.send(updatedData);
       }
    })
})

console.log(`https: ${httpsRun}`)
if (httpsRun) {
    const server = https.createServer({
        key: fs.readFileSync('keys/key.pem'),
        cert: fs.readFileSync('keys/cert.pem'),
    }, app)
    server.listen(gPort, function() {
        console.log(`dbServer app listening on HTTPS port ${gPort}.`)
    })
} else {
    app.listen(gPort, function() {
        console.log(`dbServer app listening on port ${gPort}.`)
    })
}
