'use strict';

var ObjectId = require('mongoose').Types.ObjectId;

exports.create = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('createSite', function() {

		var fieldsToSet = {
			name: req.body.name
			};

		req.app.db.models.Site.create(fieldsToSet, function(err, account) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.site = account;
			return workflow.emit('response');
		});
	});

	workflow.emit('createSite');
}

exports.findAll = function(req, res, next) {

	//lean sets returned sites as plain js objects insteads of instanceof mongoose.Document
	req.app.db.models.Site.find().lean().exec(function(err, sites) {
		req.app.db.models.Account.find({}, function(err, accounts) {
			console.log(JSON.stringify(accounts));
			res.render('admin/sites/index', {
				data: {
					siteList: escape(JSON.stringify(sites)),
					accountList: escape(JSON.stringify(accounts))
				}
			});
		});
	});

};

exports.find = function(req, res, next) {

	console.log('on express find ' + req.params.id);
	req.app.db.models.Site.findById(new ObjectId(req.params.id)).exec(function(err, site) {
		console.log('err');
		console.log(err);
		console.log('site');
		console.log(site);

		//res.send(site);

		res.render('admin/sites/details', {
			data: {
				site: escape(JSON.stringify(site)),
			}
		});

	});
};

exports.update = function(req, res, next) {
	console.log('on express update');
	console.log(JSON.stringify(req.body))

	var workflow = req.app.utility.workflow(req, res);
	/*
	var fieldsToSet = {
		permissions: req.body.permissions
	};*/

	var fieldsToSet = req.body;

	workflow.on('findByIdAndUpdate', function(err) {
		req.app.db.models.Site.findByIdAndUpdate(new ObjectId(req.params.id), fieldsToSet, function(err, site) {
			return workflow.emit('exception', err);
			console.log(err);
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.site = site;
			return workflow.emit('response');
		});

	});
	workflow.emit('findByIdAndUpdate');
};