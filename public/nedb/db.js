const {
  app,
} = require( 'electron' );
const path = require( 'path' );
const Datastore = require( 'nedb' );

const db = {

  // {
  //   "title":"example title",
  //   "dateStart":1689007890714,
  //   "dateStop":1689007893624,
  //   "_id":"keWc3LpdkhY6bSN8",
  //   "createdAt": {"$$date":1689007890716},
  //   "updatedAt":{"$$date":1689007893626}
  // }
  timeSlots: new Datastore( {
    autoload: true,
    filename: path.join( app.getPath("userData"), "/timeSlots.db"),
    timestampData: true,
  } ),

  // {
  //   "connectedId":"keWc3LpdkhY6bSN8",
  //   "type":"timeSlot",
  //   "_id":"keWc3LpdkhY6bSN8",
  //   "createdAt": {"$$date":1689007890516},
  //   "updatedAt":{"$$date":1689007890516}
  // }
  current: new Datastore( {
    autoload: true,
    filename: path.join( app.getPath("userData"), "/current.db"),
    timestampData: true,
  } ),


  settings: new Datastore( {
    autoload: true,
    filename: path.join( app.getPath("userData"), "/settings.db"),
    timestampData: true,
  } ),


};

module.exports = db;