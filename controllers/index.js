

exports.index = function(req, res, next) {
  res.render('index', { title: 'Phoenix Data' });
}

exports.fileUploadPage = function(req, res, next) {
  res.render('fileUpload', { title: 'Phoenix Data' });
}

exports.fileUpload = function(req,res,next) {
    // Document to be inserted
    const userInput = req.body;

   
    Joi.validate(userInput,(err,result)=>{
        if(err)
        	console.log(err);
        else{
            db.getDB().collection(collection).insertOne(userInput,(err,result)=>{
                if(err)
                	console.log(err);
                else
                    res.json({result : result, document : result.ops[0],msg : "Successfully inserted file!!!",error : null});
            });
        }
    })    
}
