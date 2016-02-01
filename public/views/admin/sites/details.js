/* global app:true */

(function() {
	'use strict';

	app = app || {};

	app.Site = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			success: false,
			errors: [],
			errfor: {},
			owners: {},
			permissions: {
				read: {},
				write: {}
			},
			path: '',
			name: '',
			_location:''
		},
		url: function() {
			return '/admin/sites/' + this.id + '/';
		}
	});

	app.Account = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			success: false,
			errors: [],
			errfor: {},
			first: '',
			middle: '',
			last: '',
			company: '',
			phone: '',
			zip: ''
		},
		url: function() {
			return '/admin/accounts/' + this.id + '/';
		}
	});

	app.HeaderView = Backbone.View.extend({
		el: '#header',
		template: _.template($('#tmpl-header').html()),
		initialize: function() {
			this.model = app.mainView.model;
			this.listenTo(this.model, 'change', this.render);
			this.render();
		},
		render: function() {
			this.$el.html(this.template(this.model.attributes));
		}
	});

	app.DetailsView = Backbone.View.extend({
		el: '#details',
		template: _.template($('#tmpl-details').html()),
		events: {
			'click .btn-update': 'update'
		},
		initialize: function() {
			this.model = new app.Site();
			this.syncUp();
			this.listenTo(app.mainView.model, 'change', this.syncUp);
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		syncUp: function() {
			console.log("--DEBUG@syncup");
			this.model.set({
				_id: app.mainView.model.id,
				name: app.mainView.model.get('name'),
				path: app.mainView.model.get('path'),
				_location: app.mainView.model.get('_location')
			});
		},
		render: function() {
			console.log("--DEBUG@render");

			this.$el.html(this.template(this.model.attributes));

			for (var key in this.model.attributes) {
				
				if (this.model.attributes.hasOwnProperty(key)) {
					console.log("--DEBUG@ keys render "+key+" value of key "+this.model.attributes[key]);
					this.$el.find('[name="' + key + '"]').val(this.model.attributes[key]);
				}
			}
		},
		update: function() {
			this.model.save({
				name: this.$el.find('[name="name"]').val(),
				path: this.$el.find('[name="path"]').val(),
				_location: this.$el.find('[name="_location"]').val()
			}, {
				patch: true
			});
		}
	});
	app.MainView = Backbone.View.extend({

		el: '.page .container',
		initialize: function() {
			app.mainView = this;
			console.log("--DEBUG@ unescaping");
			console.log(unescape($('#data-site').html()));
			this.model = new app.Site(JSON.parse(unescape($('#data-site').html())));
			//console.log(JSON.stringify(this.model.get('owners')[0]));
			//ar owners=this.model.attributes.permissions.read;
			//console.log(Object.keys(this.model.attributes.permissions.read[0]));

			//var cenas=new app.Account(_id:{Object.keys(this.model.attributes.permissions.read)[0]});
			//console.log(cenas);

			app.detailsView = new app.DetailsView();
			app.headerView = new app.HeaderView();
		}
	});



	$(document).ready(function() {
		app.mainView = new app.MainView();
	});
}());