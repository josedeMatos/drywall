'use strict';

exports = module.exports = function(app, mongoose) {
  var siteSchema = new mongoose.Schema({
    /*_id: {
      type: mongoose.Schema.Types.ObjectId
    },*/
    name: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: ''
    },
    owners: {},
    permissions: {
      read: {},
      write: {}
    },
    search: [String]
  });

  siteSchema.plugin(require('./plugins/pagedFind'));
  siteSchema.index({
    path: 1
  });
  siteSchema.index({
    name: 1
  });
  siteSchema.index({
    owners: 1
  });
  siteSchema.index({
    search: 1
  });
  siteSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Site', siteSchema);
};