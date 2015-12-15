'use strict';

exports.init = function(req, res,next){
  var account=(req.user.roles.account);
  console.log(account);
  res.render('account/index',account);
};
