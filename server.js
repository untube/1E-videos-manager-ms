var express = require("express");
var app = express();
var port = 4000;
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
    fieldname: String,
    originalname:String,
    encoding: String,
    mimetype: String,
    destination: String,
    filename: String,
    path: String,
    size: {type:Number,max:[10000000000,"tamaño max superado"]},
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
        })
        .catch(err => {
            res.status(400).send("Unable to save to database "+err);
        });

        Video.find({},function(err,docs){
            console.log(docs)
        })
});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});