'use strict';
var ObjectId = require('mongoose').Types.ObjectId;

var pusherror = function(err, workflow) {

	workflow.outcome.errors.push(err);
	workflow.outcome.status = false;
	return workflow.emit('response');
};

exports.validateAccess = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	var path = req.query.path || req.headers.origin;
	var accntID = undefined;

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

			if (sites[0].owners[accntID]) {
				workflow.outcome.status = true;
				return workflow.emit('response');
			} else
				pusherror("Not accessible", workflow)
		})
	});

	if (req.user)
		accntID = req.user.roles.account._id;
	
	if (accntID)
		workflow.emit('checkUsersValidity');
	else
		return pusherror("Not logged in.", workflow);

}