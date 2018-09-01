'use strict';
module.exports = function(app) {
  var controller = require('../controllers/DataRefinementController');
  /* THESE ROUTES NEED TO BE SECURED WITH ADMIN TOKENS ON THE SITE ELSE ANYONE CAN DO THIS*/
  app.route('/hltb/all')
    .get(controller.getHLTBAll)
  app.route('/images/download/:platformID')
    .get(controller.downloadAllImages)
  app.route('/images/thumbs/:platformID')
    .get(controller.createThumbsFromImages)
  app.route('/images/thumbs/:platformID/:gameID')
    .get(controller.reThumbImageFromGameID)
  app.route('/images/redownload/:platformID/:gameID')
    .get(controller.redownloadImageFromGameID)
  /* THESE ROUTES NEED TO BE SECURED WITH ADMIN TOKENS ON THE SITE ELSE ANYONE CAN DO THIS*/
};