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
			name: ''
		},
		url: function() {
			return '/admin/sites/' + this.id + '/';
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
			this.model.set({
				_id: app.mainView.model.id,
				name: app.mainView.model.get('name'),
				path: app.mainView.model.get('path')
			});
		},
		render: function() {
			this.$el.html(this.template(this.model.attributes));

			for (var key in this.model.attributes) {
				if (this.model.attributes.hasOwnProperty(key)) {
					this.$el.find('[name="' + key + '"]').val(this.model.attributes[key]);
				}
			}
		},
		update: function() {
			this.model.save({
				name: this.$el.find('[name="name"]').val(),
				path: this.$el.find('[name="path"]').val()
			},{
				patch: true
			});
		}
	});
	app.MainView = Backbone.View.extend({

		el: '.page .container',
		initialize: function() {
			app.mainView = this;
			this.model = new app.Site(JSON.parse(unescape($('#data-site').html())));
			app.detailsView = new app.DetailsView();
			app.headerView = new app.HeaderView();
		}
	});



	$(document).ready(function() {
		app.mainView = new app.MainView();
	});
}());