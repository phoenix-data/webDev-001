var express = require('express');
var router = express.Router();

let index = require('../controllers/index');


/* GET home page. */
router.get('/', index.index);

/* GET file upload page. */
router.get('/fileUpload', index.fileUploadPage);

/* Upload file */
router.post('/fileUpload', index.fileUpload);

module.exports = router;