/* global app:true */

(function() {
	'use strict';

	app = app || {};

	app.Site = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			_id: undefined,
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
			return '/admin/sites/' + (this.isNew() ? '' : this.id +'/');
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

	app.HeaderView = Backbone.View.extend({
		el: '#header',
		template: _.template($('#tmpl-site-header').html()),
		events: {
			'submit form': 'preventSubmit',
			'keypress input[type="text"]': 'addNewOnEnter',
			'click .btn-add': 'addNew'
		},
		initialize: function() {
			this.model = new app.Site();
			this.listenTo(this.model, 'change', this.render);
			this.render();
		},
		render: function() {
			this.$el.html(this.template(this.model.attributes));
		},
		preventSubmit: function(event) {
			event.preventDefault();
		},
		addNewOnEnter: function(event) {
			if (event.keyCode !== 13) {
				return;
			}
			event.preventDefault();
			this.addNew();
		},
		addNew: function() {
			if (this.$el.find('[name="name"]').val() === '') {
				alert('Please enter a name.');
			} else {
				this.model.save({
					'name': this.$el.find('[name="name"]').val()
				}, {
					success: function(model, response) {
						if (response.success) {
							model.id = response.site._id;
							location.href = model.url();
						} else {
							alert(response.errors.join('\n'));
						}
					}
				});
			}
		}
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

	app.oldGridView = Backbone.View.extend({
		accList: {},
		template: _.template($('#tmpl-grid').html()),
		events: {
			'click input[type=checkbox]': 'permissionChange',
			'click .btn-details': 'viewDetails'
		},
		viewDetails: function() {
			location.href = this.model.url();
		},
		initialize: function(options) {
			this.accList = options.accList;
			//this.listenTo(app.mainView.account, 'change', this.syncUp);
			this.listenTo(this.model, 'sync', this.render);
		},
		render: function() {
			console.log('onrender')
			console.log(this.model.attributes.permissions);
			this.$el.html(this.template({
				model: this.model.attributes,
				accs: this.accList,
				checkPresence: function(idx) {
					console.log('checkPresence');
					console.log(this.model.owners[this.accs[idx]._id] ? 'checked' : '');
					return this.model.owners[this.accs[idx]._id] ? 'checked' : undefined;
				}
			}));
			return this;
		},
		permissionChange: function(e) {
			var model = this.model.attributes;
			var accIDX = $(e.currentTarget).attr('accid');
			var accID = this.accList[accIDX]._id;
			var insert = (e.currentTarget.checked);
			var permissionToEditKey = $(e.currentTarget).attr('permitKey');
			var changes = {};
			var keys = Object.keys(model.permissions);
			var keysLength = keys.length;

			if (permissionToEditKey) {
				changes.permissions = $.extend(true, {}, model.permissions);

				if (insert)
					changes.permissions[permissionToEditKey][accID] = {};
				else
					changes.permissions[permissionToEditKey][accID] = undefined;

			} else {
				changes.owners = $.extend(true, {}, model.owners);
				if (insert)
					changes.owners[accID] = {};
				else
					changes.owners[accID] = undefined;
			}
			/*
						for (var i = 0; i < keysLength; i++) {
							changes.permissions[keys[i]] = {};

							var permissionKeys = Object.keys(model.permissions[keys[i]]);
							var permissionKeysLength = permissionKeys.length;

							if (permissionKeysLength > 0) {
								for (var f = 0; f < permissionKeysLength; f++) {
									changes.permissions[keys[i]][permissionKeysLength[f]] = {};
								}
								if (insert)
									changes.permissions[keys[i]][accID] = {};
								else
									changes.permissions[keys[i]][accID] = undefined;
							} else {
								if (insert)
									changes.permissions[keys[i]][accID] = {};
							}
						}*/

			console.log('JSON.stringify(changes)');
			console.log(JSON.stringify(changes));
			this.model.save(changes, {
				patch: true
			});
			/*
						this.model.save({
							permissions: {
								read: {
									accID: "test"
								}
							}
						});*/

		}
	});

	app.GridResultsView = Backbone.View.extend({
		accList: {},
		template: _.template($('#tmpl-grid-scnd').html()),
		events: {
			'click input[type=checkbox]': 'permissionChange',
			'click .btn-details': 'viewDetails'
		},
		viewDetails: function() {
			location.href = this.model.url();
		},
		initialize: function(options) {
			this.accList = options.accList;
			//this.listenTo(app.mainView.account, 'change', this.syncUp);
			this.listenTo(this.model, 'sync', this.render);
		},
		render: function() {
			this.$el.html(this.template({
				model: this.model.attributes,
				accs: this.accList,
				permitKeys: Object.keys(this.model.attributes.permissions),
				checkPresence: function(id, key, list) {
					console.log('list');
					console.log(list);
					var arrToCheck = key ? this.model.permissions[key] : this.model.owners;
					return arrToCheck[id] ? 'checked' : undefined;
				}
			}));
			return this;
		},
		permissionChange: function(e) {
			var model = this.model.attributes;
			var accID = $(e.currentTarget).attr('accid');
			var insert = (e.currentTarget.checked);
			var permissionToEditKey = $(e.currentTarget).attr('permitKey');
			var changes = {};
			var keys = Object.keys(model.permissions);
			var keysLength = keys.length;

			console.log(permissionToEditKey);
			console.log(keys);
			//			keysLength["errr"].throwcenas;

			if (permissionToEditKey) {
				changes.permissions = $.extend(true, {}, model.permissions);

				if (insert)
					changes.permissions[permissionToEditKey][accID] = {};
				else
					changes.permissions[permissionToEditKey][accID] = undefined;

			} else {
				changes.owners = $.extend(true, {}, model.owners);
				if (insert)
					changes.owners[accID] = {};
				else
					changes.owners[accID] = undefined;
			}

			console.log('JSON.stringify(changes)');
			console.log(JSON.stringify(changes));
			this.model.save(changes, {
				patch: true
			});
			/*
						this.model.save({
							permissions: {
								read: {
									accID: "test"
								}
							}
						});*/

		}
	});

	app.GridView = Backbone.View.extend({
		el: '',
		/*		template: _.template($('#tmpl-results-table').html()),*/
		initialize: function() {
			//this.collection = new app.RecordCollection(app.mainView.results.data);

			this.sitesParsed = app.mainView.sitesParsed;
			this.accParsed = app.mainView.accParsed;

			this.listenTo(this.collection, 'reset', this.render);
			this.render();
		},
		render: function() {
			//this.$el.html(this.template());

			var sitesArr = [],
				accArr = [];


			this.sitesParsed.forEach(function(element) {
				sitesArr.push(new app.Site(element));
			});
			this.accParsed.forEach(function(element, index, array) {
				accArr.push(new app.Account(element));
			});

			this.siteCollection = new app.SiteCollection(sitesArr);
			this.accCollection = new app.AccountCollection(accArr);

			var frag = document.createDocumentFragment();
			this.siteCollection.each(function(site) {

				var view = new app.GridResultsView({
					model: site,
					accList: this.accParsed
				});

				frag.appendChild(view.render().el);
			}, this);
			console.log('appending');
			$('#sites-grids').append(frag);
		}
	});

	app.MainView = Backbone.View.extend({

		el: '.page .container',
		initialize: function() {
			console.log('initialize');
			app.mainView = this;


			var sitesParsed = JSON.parse(unescape($('#data-siteList').html())),
				accParsed = JSON.parse(unescape($('#data-accountList').html()));

			this.sitesParsed = sitesParsed;
			this.accParsed = accParsed;

			var sitesArr = [],
				accArr = [];
			app.headerView = new app.HeaderView();
			app.gridView = new app.GridView();
			/*
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

							var view = new app.GridView2({
								model: site,
								accList: accParsed
							});

							frag.appendChild(view.render().el);
						}, this);
						$('#sites-grids').append(frag);*/


		}
	});



	$(document).ready(function() {
		app.mainView = new app.MainView();
	});
}());