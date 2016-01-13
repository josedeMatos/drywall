'use strict';
var ObjectId = require('mongoose').Types.ObjectId;

exports.find = function(req, res, next) {

	var owners = "owners." + req.user.roles.account._id;
	var siteList = req.app.db.models.Site.find({
		owners: {
			'$exists': true
		}
	}, function(err, doc) {
		res.render('account/sites/index', {
			data: {
				siteList: escape(JSON.stringify(doc))
			}
		});
	});

};

exports.read = function(req, res, next) {

	var outcome = {};

	var getAccountData = function(callback) {
		req.app.db.models.Account.findById(req.user.roles.account.id, 'name company phone zip').exec(function(err, account) {
			if (err) {
				return callback(err, null);
			}

			outcome.account = account;
			callback(null, 'done');
		});
	};

	var getSiteData = function(callback) {

		req.app.db.models.Site.findById(new ObjectId(req.params.id)).exec(function(err, site) {
			if (err) {
				return callback(err, null);
			}
			outcome.site = site;
			callback(null, 'done');
		});
	};

	var asyncFinally = function(err, results) {
		if (err) {
			return next(err);
		}

		res.render('account/sites/details', {
			data: {
				account: escape(JSON.stringify(outcome.account)),
				site: escape(JSON.stringify(outcome.site))
			}
		});
	};

	require('async').parallel([getAccountData, getSiteData], asyncFinally);



};

exports.details = function(req, res, next) {

	req.app.db.models.AdminGroup.findById(req.params.id).exec(function(err, site) {

	});

};


exports.update = function(req, res, next) {

	var workflow = req.app.utility.workflow(req, res);

	var fieldsToSet = req.body;
	var sitetoUpdt = {};

	workflow.on('validate', function() {

		req.app.db.models.Site.findById(new ObjectId(req.params.id), function(err, site) {
			if (err) {
				return workflow.emit('exception', err);
			}
			if (site.owners[req.user.roles.account._id]) {
				sitetoUpdt = site;
				workflow.emit('updateSite');
			} else {
				workflow.outcome.errors.push('You may not edit this entry.');
				return workflow.emit('response')
			}


		});
	});

	workflow.on('updateSite', function(err) {
		sitetoUpdt.update(fieldsToSet, function(err, site) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.site = site;
			return workflow.emit('response');
		});

	});
	workflow.emit('validate');
};