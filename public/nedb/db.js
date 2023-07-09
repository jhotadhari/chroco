const {
  app,
} = require('electron');
const path = require('path');
const Datastore = require('nedb');

const db = new Datastore( {
  autoload: true,
  filename: path.join( app.getPath("userData"), "/fucking-simple-time-tracker.db"),
  timestampData: true,
} );

module.exports = db;