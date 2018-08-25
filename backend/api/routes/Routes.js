'use strict';
module.exports = function(app) {
  var controller = require('../controllers/Controller');
      // todoList Routes
  app.route('/hltb/all')
    .get(controller.getHLTBAll)

};