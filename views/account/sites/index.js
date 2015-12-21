'use strict';

exports.find = function(req, res, next) {
	//db.sites.find({"owners.56718430ba159e8402af82d7":{'$exists':true}})

	var owners = "owners." + req.user.roles.account._id;
	var siteList = req.app.db.models.Site.find({
		owners: {
			'$exists': true
		}
	}, function(err, doc) {
		res.render('account/sites/index', {
			data: {siteList:escape(JSON.stringify(doc))}
		});
	});

};

exports.details = function(req, res, next) {

	req.app.db.models.AdminGroup.findById(req.params.id).exec(function(err, site) {
		
	});

};