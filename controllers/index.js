

exports.index = function(req, res, next) {
  res.render('index', { title: 'Phoenix Data' });
}

exports.fileUpload = function(req, res, next) {
  res.render('fileUpload', { title: 'Phoenix Data' });
}