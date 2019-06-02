
var express = require("express");
var app = express();
var port = 3001;
var bodyParser = require('body-parser');
const config = require('./db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({extended:true}))

const multer = require("multer");

let storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null,'./video')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
})

const upload = multer({ storage });

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(config.DB, function(err, db) {
    if(err) {
        console.log('database is not connected')
    }
    else {
        console.log('connected!!'+err)
    }
});

var videoSchemaJSON = {
    user_id:Number,
    category_id:String,
    title:String,
    description:String,
    destination: String,
    views:Number,
    size: {type:Number,max:[50000000,"tamaño max superado"]},
    fieldname: String,
    originalname:String,
    encoding: String,
    filename: String,
    data:String
};

var Video = mongoose.model("Video", videoSchemaJSON);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.post('/upload',upload.single('file'), function(req, res) {
    mongoose.connect(config.DB, function(err, db) {
        if(err) {
            console.log('database is not connected')
        }
        else {
            console.log('connected!!'+err)
        }
    });
    

    var video = new Video(req.file);
    var fs = require('fs');
    console.log(video)
    var videoFile = fs.readFileSync('./video/'+video.originalname);
    // Convert the video data to a Buffer and base64 encode it.
    var encoded = new Buffer(videoFile).toString('base64');
    video["data"]=encoded;

    video.save()
        .then(item => {
            res.send("Video saved to database ");
            console.log(req)
        })
        .catch(err => {
            res.status(400).send("Unable to save to database "+err);
        });

        Video.find({},function(err,docs){
            console.log(docs)
        })
});

app.post('/uploadVideo', function(req, res) {
    mongoose.connect(config.DB, function(err, db) {
        if(err) {
            console.log('database is not connected')
        }
        else {
            console.log('connected!!'+err)
        }
    });
    var video = new Video(req.body);

    video.save()
    .then(item => {
        console.log("Video saved to database ");
        
    })
    .catch(err => {
        console.log("Unable to save to database "+err);
    });

    console.log(video)
    res.send(req.body)

});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});