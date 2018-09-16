'use strict';
module.exports = function(app) {
  var controller = require('../controllers/DataRefinementController')
  var gameController = require('../controllers/GamesController')
  /* THESE ROUTES NEED TO BE SECURED WITH ADMIN TOKENS ON THE SITE ELSE ANYONE CAN DO THIS*/
  app.route('/hltb/all')
    .get(controller.getHLTBAll)
  app.route('/image/download/:platformID')
    .get(controller.downloadAllImagesPlatform)
  app.route('/image/download/general/:platformID')
    .get(controller.downloadAllImagesGeneral)
  app.route('/image/thumbs/:platformID')
    .get(controller.createThumbsFromImages)
  app.route('/image/thumbs/general/:platformID')
    .get(controller.createThumbsFromImagesGeneral)
  app.route('/image/thumbs/:platformID/:gameID')
    .get(controller.reThumbImageFromGameID)
  app.route('/image/redownload/:platformID/:gameID')
    .get(controller.redownloadImageFromGameID)
  /* THESE ROUTES NEED TO BE SECURED WITH ADMIN TOKENS ON THE SITE ELSE ANYONE CAN DO THIS*/
  /* Needs authentication checkup */
  app.route('/games/list/:platformID/:lowerLimit/:upperLimit')
    .get(gameController.getGameFromPlatform)
  app.route('/games/search/:searchQuery/:platformID/:lowerLimit/:upperLimit')
    .get(gameController.getGameFromPlatformWithSearchQuery)
  app.route('/games/search/:searchQuery/:lowerLimit/:upperLimit')
    .get(gameController.getGameFromSearchQuery)
  /* --------------------------- */
};