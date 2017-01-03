var express = require('express');
var router = express.Router();

router.get('/logout', function(req,res,next) {
  var domain = req.cookies.domain;
  var date = new Date();
  res.cookie("user", "", { expires: date});
  res.cookie("token", "", { expires: date});
  res.cookie("domain", "", { expires: date});
  res.redirect(domain +'/signon');
});

router.get('*', function(req, res, next) {
  /*var token = req.cookies.token;
  var domain = req.cookies.domain;
  var user = req.cookies.user;
  if (!(token && domain && user)) {
    res.redirect('http://'+req.hostname+'/signon/');
    return;
  }*/
  res.render('main', {
    base:(process.env.APP_BASE ? process.env.APP_BASE : '')
  });
});

module.exports = router;