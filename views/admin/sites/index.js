'use strict';

exports.findAll = function(req, res, next) {

//lean sets returned sites as plain js objects insteads of instanceof mongoose.Document
	req.app.db.models.Site.find().lean().exec( function(err, sites) {
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
	console.log('on express find');
	req.app.db.models.Site.findById(req.params.id).exec(function(err, site) {
		res.send(site);
	});
};

exports.update = function(req, res, next) {
	console.log('on express update');
	console.log(JSON.stringify(req.body))
/*
	req.app.db.models.Site.findByIdAndUpdate(req.params.id).exec(function(err, site) {

	});*/
};