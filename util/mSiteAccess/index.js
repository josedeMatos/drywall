'use strict';

var crypto = require('crypto');
var ObjectId = require('mongoose').Types.ObjectId;

var getHash = function(path, accntID) {
	return crypto.createHash('md5').update('' + accntID).update(path).digest('hex');
}

var returnToken = function(err, token, workflow) {
	if (err) {
		workflow.outcome.status = false;
		return workflow.emit('response');
	}

	workflow.outcome.status = true;
	workflow.outcome.token = token;
	return workflow.emit('response');
};

var pusherror = function(err, workflow) {

	workflow.outcome.errors.push(err);
	workflow.outcome.status = false;
	return workflow.emit('response');
};

var createAndCheckCallback = function(err, data, workflow) {
	if (err) {
		pusherror(err, workflow)
	}
	if (typeof data === Array) {
		if (data.length <= 0)
			pusherror(err, workflow)
		if (data[0].owners[accntID])
			workflow.emit('createToken');
		else
			pusherror("Can't Access", workflow);
	} else
	if (token)
		returnToken(err, token, workflow)
	else
		workflow.emit('checkUsersValidity');
};

exports.createOrFind = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	var token = req.query.token || undefined;
	var path = req.body.path || req.headers.origin;
	var accntID = undefined,
		md5 = undefined;

	workflow.on('checkUsersValidity', function() {
		var rexp = new RegExp("((http|https)\:\/\/||www)" + path + "(\/\S*)?");
		req.app.db.models.Site.find({
			path: {
				$regex: rexp,
				$options: '<options>'
			},
			owners: {
				'$exists': true
			}
		}, function(err, sites) {
			if (err || sites.length <= 0)
				return pusherror(err || "No entries matched.", workflow);
			console.log(sites);
			if (sites[0].owners[accntID]) {
				workflow.outcome.status = true;
				return workflow.emit('response');
			} else
				pusherror("Not accessible", workflow)
		})
	});

	if (req.user) {
		console.log("--DEBUG@userolres");
		console.log(req.user.roles);
		accntID = req.user.roles.account._id;
		md5 = getHash(path, accntID);
	}

	if (accntID)
		workflow.emit('checkUsersValidity');
	else
		return pusherror("Not logged in.", workflow);

}