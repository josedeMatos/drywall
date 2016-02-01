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

	req.app.db.models.Site.findById(new ObjectId(req.params.id)).lean().exec(function(err, site) {
		console.log(JSON.stringify(site));
		console.log("--DEBUG@ render find");
		console.log(JSON.stringify(site));
		res.render('admin/sites/details', {
			data: {
				site: escape(JSON.stringify(site)),
			}
		});

	});
};

exports.update = function(req, res, next) {
/*
	var workflow = req.app.utility.workflow(req, res);

	var fieldsToSet = req.body;

	workflow.on('findByIdAndUpdate', function(err) {
		req.app.db.models.Site.findByIdAndUpdate(new ObjectId(req.params.id), fieldsToSet, function(err, site) {
			console.log("@DEBUG-"+err);
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.site = site;
			return workflow.emit('response');
		});

	});
	workflow.emit('findByIdAndUpdate');*/
};

exports.delete = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.user.roles.admin.isMemberOf('root')) {
      workflow.outcome.errors.push('You may not delete accounts.');
      return workflow.emit('response');
    }

    workflow.emit('deleteSite');
  });

  workflow.on('deleteSite', function(err) {
    req.app.db.models.Site.findByIdAndRemove(new ObjectId(req.params.id), function(err, site) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.site = site;
      workflow.emit('response');
    });
  });

  workflow.emit('validate');
};