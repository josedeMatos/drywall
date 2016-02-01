'use strict';
var ObjectId = require('mongoose').Types.ObjectId;

var pusherror = function(err, workflow) {

	workflow.outcome.errors.push(err);
	workflow.outcome.status = false;
	return workflow.emit('response');
};

exports.proxyGet = function(req, res, next) {
	//var workflow = req.app.utility.workflow(req, res);
	var target=req.params.site;
	console.log("--DEBUG@ proxy "+target);
	req.url='/';
	req.app.proxyserver.web(req, res,{
      target: 'http://localhost:9090'
    });

}