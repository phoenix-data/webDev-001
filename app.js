const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');


const app = express();


//Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


//Mongo URI
const mongoURI = "mongodb://localhost:27017/Phoenix_mongodb";

//Create mongo connection
const conn = mongoose.createConnection(mongoURI);

//Init gfs
let gfs;

var conn = mongoose.createConnection(..);
conn.once('open', () => {
	//Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('files');
});

//Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'files'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

app.get('/', (req, res)=>{
	res.render('index');
});

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));