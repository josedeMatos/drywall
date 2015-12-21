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
	app.SiteCollection = Backbone.Collection.extend({
		model: app.Site
	});

	app.Account = Backbone.Model.extend({
		idAttribute: '_id',
		url: function() {
			return '/admin/accounts/' + this.id + '/';
		}
	});
	app.AccountCollection = Backbone.Collection.extend({
		model: app.Account
	});

	app.ListView = Backbone.View.extend({
		el: '#site-list',
		template: _.template($('#tmpl-site-list').html()),
		events: {
			'click .btn-details': 'Viewsite'
		},
		initialize: function() {
			console.log(unescape($('#data-siteList').html()));
			var sitesParsed = JSON.parse(unescape($('#data-siteList').html()));
			var sitesArr = [];
			sitesParsed.forEach(function(element, index, array) {
				sitesArr.push(new app.Site(element));
			});
			this.collection = new app.SiteCollection(sitesArr);
			this.$el.html(this.template({
				sites: JSON.parse(unescape($('#data-siteList').html()))
			}));
		},
		Viewsite: function(e) {
			console.log($(e.currentTarget).attr('id'));
			location.href = $(e.currentTarget).attr('id');
		}
	});

	app.GridView = Backbone.View.extend({
		accList: {},
		template: _.template($('#tmpl-grid').html()),
		events: {
			'click input[type=checkbox]': 'Viewsite'
		},
		initialize: function(options) {
			this.accList = options.accList;
		},
		render: function() {
			console.log('onrender')
			console.log(this.model.attributes.permissions);
			this.$el.html(this.template({
				model: this.model.attributes,
				accs: this.accList,
				checkPresence:function(idx){
					console.log('checkPresence');
					console.log(this.model.owners[this.accs[idx]._id]?'checked':'');
					return this.model.owners[this.accs[idx]._id]?'checked':undefined;
				},
				testsave:function(idx){
					return this.model.permissions.read["testinsave"]?'checked':'';
				}
			}));
			return this;
		},
		Viewsite: function(e) {
			console.log(e);
			this.model.save({
				permissions: {
					read: {
						"testinsave": {}
					}
				}
			});
		}
	});

	app.MainView = Backbone.View.extend({

		el: '.page .container',
		initialize: function() {
			console.log('initialize');
			app.mainView = this;

			app.listView = new app.ListView();
			//app.resultsView = new app.ResultsView();

			var sitesParsed = JSON.parse(unescape($('#data-siteList').html())),
				accParsed = JSON.parse(unescape($('#data-accountList').html()));

			var sitesArr = [],
				accArr = [];


			sitesParsed.forEach(function(element) {
				sitesArr.push(new app.Site(element));
			});
			accParsed.forEach(function(element, index, array) {
				accArr.push(new app.Account(element));
			});

			this.siteCollection = new app.SiteCollection(sitesArr);
			this.accCollection = new app.AccountCollection(accArr);

			var frag = document.createDocumentFragment();
			this.siteCollection.each(function(site) {

				var view = new app.GridView({
					model: site,
					accList: accParsed
				});

				frag.appendChild(view.render().el);
			}, this);
			$('#sites-grids').append(frag);
		}
	});



	$(document).ready(function() {
		app.mainView = new app.MainView();
	});
}());