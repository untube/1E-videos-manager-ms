const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
var fs = require('fs');
const DB = 'mongodb://35.196.3.185:27017';
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// Mongo URI //using MLabs
const mongoURI = DB;

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
    });
  }
});
const upload = multer({ storage });
// @route GET /
// @desc Loads form
app.get('/', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('index', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('index', { files: files });
    }
    
  });
}); 
var videoSchemaJSON = {
  user_id:Number,
  video_id:String,
  category_id:String,
  title:String,
  description:String,
  views:Number,
  originalname:String, 
  filename: String,
  image:String
};
// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload/:user_id/:category_id/:title/:description', upload.single('file'), (req, res) => {
  res.json( {"status":"uploading"} );
  var video = {}
  video["user_id"] = parseInt(req.params.user_id)
  video["video_id"] = req.file.id
  video["category_id"] = req.params.category_id
  video["title"]= req.params.title
  video["description"] = req.params.description
  video["views"] = 0
  video["originalname"]=req.file.originalname
  video["filename"]=req.file.filename

  saveModelVideo(video,'imagenes/default.jpg')
  //saveVideo(req.file.id,video);
 // res.redirect('/');
});

// @route GET /files
// @desc  Display all files in JSON
 app.get('/files', (req, res) => {
   gfs.files.find().toArray((err, files) => {
//     // Check if files
     if (!files || files.length === 0) {
       return res.status(404).json({
         err: 'No files exist'
       });
     }
//     // Files exist

     return res.json(files);
   });
 });

 app.get('/catagolo', (req, res) => {
  Video.find({},{title:1,video_id:1},function(err,docs){
    console.log(docs)
    res.json(docs)
})
});

app.get('/miniaturas', (req, res) => {
  Video.find({},{title:1,video_id:1,image:1},function(err,docs){
    console.log(docs)
    res.json(docs)
})
});

app.get('/category/:category_id', (req, res) => {
  Video.find({category_id:req.params.category_id},{title:1,video_id:1},function(err,docs){
    console.log(docs)
    res.json(docs)
})
});

app.get('/video_user/:user_id', (req, res) => {
  Video.find({user_id:req.params.user_id},{title:1,video_id:1},function(err,docs){
    console.log(docs)
    res.json(docs)
})
});

// @route GET /files/:filename
// @desc  Display single file object
app.get('/files/:_id', (req, res) => {
  // console.log(req.params._id)
  gfs.files.find({ _id: req.params._id }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists',
        mensaje: {err}
      });
    }
    // const readstream = gfs.createReadStream(file.filename);
    const readstream = gfs.createReadStream({_id: req.params._id});
    let fs = require('fs');
 //  gfs.createReadStream({_id: req.params._id}).pipe(fs.createWriteStream('a1_cppy.mp4')) 
//.on('data', function (chunk) {
 
  //  console.log(chunk.toString());
 
//});
    return readstream.pipe(res);
  });
});
//subir modelo del video, se acompaña de la imagen en bse64, el id del video y el id del usuario,
// se agrega categoria



var Video = conn.model("Video", videoSchemaJSON);

// @route DELETE /files/:id
// @desc  Delete file
app.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/');
  });
});




function imagen(_id,video){

  var thumbler = require('media-thumb');
  var options1 = {
    time : '00:00:01',
    size : {
      width:  120,
      height: 120
    }
  }
  
  thumbler.extract('videos/'+_id+'.mp4', 'imagenes/'+_id+'.jpg', options1, function(error){  
    if (!error) {
      console.log('thumbnail saved to thumb1.jpg (300x120) with a frame at 00:00:05');
      fs.unlink('videos/'+_id+'.mp4', (err) => {
        if (err) {
          console.error(err)
        }})
        var imageFile = fs.readFileSync('imagenes/'+_id+'.jpg');
        var encoded = new Buffer(imageFile).toString('base64');
        video["image"]= encoded;
        var video_ = new Video(video);
      
        video_.save()
        .then(item => {
            console.log("Video saved to database ");
            
        })
        .catch(err => {
            console.status(400).send("Unable to save to database "+err);
        });
        //saveModelVideo(video,'imagenes/'+_id+'.jpg')
    } else {console.log(err)}  
  });
  
 

}

function saveModelVideo(video,path){
  
  var imageFile = fs.readFileSync('imagenes/default.jpg');
  var encoded = new Buffer(imageFile).toString('base64');
  video["image"]= encoded;
  var video_ = new Video(video);

  video_.save()
  .then(item => {
      console.log("Video saved to database ");
      
  })
  .catch(err => {
      console.status(400).send("Unable to save to database "+err);
  });



}

function saveVideo(_id,video){
  console.log(_id)
    gfs.createReadStream({_id: _id}).pipe(fs.createWriteStream('videos/'+_id+'.mp4')) 
    .on('data', function (chunk) { 
    console.log(chunk.toString()+ "SAVE"); 
  });
  //setTimeout(function(){
    //console.log("create image!");
    //imagen(_id,video)
  //}, 0)
} 


const port = 3001;

app.listen(port, () => console.log(`Server started on port ${port}`));

