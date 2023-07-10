const {
  app,
} = require('electron');
const path = require('path');
const Datastore = require('nedb');

const db = {
  timeSlots: new Datastore( {
    autoload: true,
    filename: path.join( app.getPath("userData"), "/timeSlots.db"),
    timestampData: true,
  } ),


};

module.exports = db;