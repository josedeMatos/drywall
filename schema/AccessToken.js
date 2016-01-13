'use strict';

exports = module.exports = function(app, mongoose) {
  var accessTokenSchema = new mongoose.Schema({
    token: { type: String, default: '' },
    path: { type: String, default: '' },
    createdAt: { type: Date, expires: '1m',required: true  }
  });
  accessTokenSchema.index({ token: 1 });
  accessTokenSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('AccessToken', accessTokenSchema);
};
