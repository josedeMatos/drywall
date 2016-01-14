/* global app:true */

(function() {
	'use strict';

	app = app || {};

	app.AccessMS = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      status: false,
      path:''
    },
    url: function() {
    	console.log("--DEBUG@ url");
    	console.log(this);
			return '/validateAccess?path='+this.get('path');
		} 
  });

	app.ListView = Backbone.View.extend({
		el: '#site-list',
		template: _.template($('#tmpl-site-list').html()),
		events: {
			'click .btn-details': 'Viewsite',
			'click a': 'GotoSite',
		},
		initialize: function() {
			this.$el.html(this.template({
				sites: JSON.parse(unescape($('#data-siteList').html()))
			}));
		},
		Viewsite: function(e) {
			console.log($(e.currentTarget).attr('id'));
			location.href = $(e.currentTarget).attr('id');
		},
		GotoSite: function(e) {
			e.preventDefault();
			var access=new app.AccessMS();
			this.listenTo(access, 'sync', this.jumpToPath);
			access.set('path',$(e.currentTarget).attr('href'));
			access.fetch();
		},
		jumpToPath:function(obj){
			if(obj.get('status'))
				location.href=obj.get('path');
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