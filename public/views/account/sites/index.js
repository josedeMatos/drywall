/* global app:true */

(function() {
	'use strict';

	app = app || {};

	app.ListView = Backbone.View.extend({
		el: '#site-list',
		template: _.template($('#tmpl-site-list').html()),
		events: {
			'click .btn-details': 'Viewsite'
		},
		initialize: function() {
			console.log(unescape($('#data-siteList').html()));
			this.$el.html(this.template({
				sites: JSON.parse(unescape($('#data-siteList').html()))
			}));
		},
		Viewsite: function(e) {
			console.log($(e.currentTarget).attr('id'));
			location.href = $(e.currentTarget).attr('id');
		}
	});

	app.MainView = Backbone.View.extend({

		el: '.page .container',
		initialize: function() {
			app.mainView = this;

			app.listView = new app.ListView();
		}
	});

	$(document).ready(function() {
		app.mainView = new app.MainView();
	});
}());