var https = require('https');
var cors = require('cors');
var bodyParser = require('body-parser')
require('dotenv').config()
var express = require('express'),
app = express(),
port = process.env.PORT || 3001;
app.use(cors({origin: '*'}));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var routes = require('./api/routes/Routes'); //importing route
routes(app); //register the route
app.use(express.static('public'))
app.listen(port);