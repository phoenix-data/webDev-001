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

// @route GET /
// @desc Loads form
app.get('/', (req, res)=>{
	gfs.files.find().toArray((err, files) =>{
		//check if files
		if(!files || files.length === 0) {
			res.render('index', { files: false });
		} else {
			files.map(file => {
				if(
					file.contentType === "image/jpeg" ||
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

// @route POST /upload
// @desc Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
	//res.json({ file: req.file });
	res.redirect('/');
});

// @route GET /files
// @desc Display all files in JSON
app.get('/files', (req,res) => {
	gfs.files.find().toArray((err, files) =>{
		//check if files
		if(!files || files.length === 0) {
			return res.status(404).json({
				err: 'No files exist'
			});
		}

		// files exist
		return res.json(files);
	});
});

// @route GET /files/:filename
// @desc Display single file  in JSON
app.get('/files/:filename', (req,res) => {
	gfs.files.findOne({filename: req.params.filename}, (err, file) => {
		//check if file
		if(!file || file.length === 0) {
			return res.status(404).json({
				err: 'No file exists'
			});
		}
		//File exists
		return res.json(file);
	});
});


// @route GET /image/:filename
// @desc Display image 
app.get('/image/:filename', (req,res) => {
	gfs.files.findOne({filename: req.params.filename}, (err, file) => {
		//check if file
		if(!file || file.length === 0) {
			return res.status(404).json({
				err: 'No file exists'
			});
		}

		//Check if image
		if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
			// read output to Browser
			const readStream = gfs.createReadStream(file.filename);
			readStream.pipe(res);
		} else {
			res.status(404).json({
				err: 'Not an image'
			});
		}
	});
});

// @route DELETE /files/:id
// @desc Delete file
app.delete('/files/:id', (req, res) => {
	gfs.remove({ _id: req.params.id, root: 'files' }, (err, gridStore) => {
		if(err) {
			return res.status(404).json({ err: err });
		}

		res.redirect('/');
	});
});


const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));