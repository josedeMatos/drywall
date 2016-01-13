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
/*
exports.oldcreateOrFind = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	console.log(req.body);

	var md5 = getHash(req.body.path, req.user.roles.account._id);

	workflow.on('createToken', function(first) {
		console.log("--DEBUG@create" + first);
		req.app.db.models.AccessToken.create({
			token: md5,
			path: req.body.path,
			createdAt: new Date()
		}, function(err, token) {
			returnToken(err, token, workflow)
		});
	});

	workflow.on('findLiveToken', function() {

		req.app.db.models.AccessToken.findOneAndUpdate({
			token: md5
		}, {
			createdAt: new Date()
		}, function(err, token) {
			if (err) {
				workflow.outcome.status = false;
				return workflow.emit('response');
			}
			console.log("--DEBUG@ refreshing " + token);
			if (token)
				returnToken(err, token, workflow)
			else
				workflow.emit('createToken', 'testing');
		});
	});

	workflow.emit('findLiveToken');

}
exports.find = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	console.log("--DEBUG@find");
	workflow.on('findLiveToken', function() {

		req.app.db.models.AccessToken.findOne({
			token: md5
		}, function(err, token) {
			if (err) {
				workflow.outcome.status = false;
				return workflow.emit('response');
			}
			workflow.outcome.status = true;
			workflow.outcome.token = token;
		});
	});

	workflow.emit('findLiveToken');
}
exports.validate = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	var token = req.query.token || undefined;
	var reqOrigin = req.headers.origin;
	var accntID = req.user.roles.account._id;
	var md5 = undefined;



	console.log((req.headers.origin));
	console.log("--DEBUG@ validate");
	console.log((req.query));

	workflow.outcome.status = true;
	return workflow.emit('response');

	workflow.on('findLiveToken', function() {

		req.app.db.models.AccessToken.findOne({
			token: md5
		}, function(err, token) {
			if (err) {
				workflow.outcome.status = false;
				return workflow.emit('response');
			}
			workflow.outcome.status = true;
			workflow.outcome.token = token;
		});
	});

	workflow.on('checkUsersValidity', function() {

		req.app.db.models.Site.find({
			path: reqOrigin,
			owners: {
				'$exists': true
			}
		}, function(err, sites) {
			if (owners[accntID])
				workflow.emit('generateToken');
			else {
				workflow.outcome.status = false;
				return workflow.emit('response');
			}
		})
	});

	workflow.on('generateToken', function() {
		md5 = getHash(reqOrigin, accntID);
		req.app.db.models.AccessToken.create({
			token: md5,
			path: req.body.path,
			createdAt: new Date()
		}, function(err, token) {
			returnToken(err, token, workflow)
		});
	});

	if (!token)
		workflow.emit('checkUsersValidity');
	else
		workflow.emit('findLiveToken');
}
*/

exports.createOrFind = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	var token = req.query.token || undefined;
	var path = req.body.path || req.headers.origin;
	var accntID = undefined,
		md5 = undefined;


	workflow.on('findLiveToken', function() {
		req.app.db.models.AccessToken.findOneAndUpdate({
			token: md5
		}, {
			createdAt: new Date()
		}, function(err, token) {
			if (err) {
				workflow.outcome.errors.push('error at findLiveToken');
				workflow.outcome.status = false;
				return workflow.emit('response');
			}
			if (token)
				returnToken(err, token, workflow)
			else
				workflow.emit('checkUsersValidity');
		});
	});

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
			if (err || sites.length <= 0) {
				workflow.outcome.errors.push(err);
				console.log("--DEBUG@checkUsersValidity " + JSON.stringify(sites) + " path: " + path);
				workflow.outcome.status = false;
				return workflow.emit('response');
			}
			if (sites[0].owners[accntID])
				workflow.emit('createToken');
			else {
				workflow.outcome.status = false;
				return workflow.emit('response');
			}
		})
	});

	workflow.on('createToken', function() {
		req.app.db.models.AccessToken.create({
			token: md5,
			path: req.body.path,
			createdAt: new Date()
		}, function(err, token) {
			returnToken(err, token, workflow)
		});
	});

	if (req.user) {
		accntID = req.user.roles.account._id;
		getHash(path, accntID);
	}

	if (accntID) {
		if (!token)
			workflow.emit('checkUsersValidity');
		else
			workflow.emit('findLiveToken');
	} else {
		workflow.outcome.errors.push("Not logged in.");
		workflow.outcome.status = false;
		return workflow.emit('response');
	}

}