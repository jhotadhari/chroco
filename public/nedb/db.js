const {
  	app,
} = require( 'electron' );
const {
	get,
} = require( 'lodash' );
const path = require( 'path' );
const Datastore = require( 'nedb' );
const { settingsDefaults } = require( '../constants' );
const { isPathValid } = require( '../utils' );

const maybeAddDynamicPaths = ( _db, dbPath ) => {
	if ( dbPath ) {
		Object.keys( dbPath ).filter( key => key !== 'settings' ).map( key => {
			const addDynamicPath = () => {
				if ( isPathValid( dbPath[key] ) ) {
					_db[key] = new Datastore( {
						autoload: true,
						filename: dbPath[key],
						timestampData: true,
					} );
				}
			};
			if ( ! _db[key] ) {
				addDynamicPath();
			} else {
				if ( _db[key].filename !== dbPath[key] ) {
					// Trigger compact. But don't wait for it to end.
					_db[key].persistence.compactDatafile();
					addDynamicPath();
				}
			}
		} );
	}
};

let db = false
const getDb = () => new Promise( ( resolve, reject ) => {

	if ( ! db ) {
		const newDb = {
			settings: new Datastore( {
				autoload: true,
				filename: path.join( app.getPath("userData"), "/settings.db"),
				timestampData: true,
			} ),
		};
		newDb.settings.find( { key: 'dbPath' }, ( err, settings ) => {
			const dbPath = get( settings, [0, 'value'], get( settingsDefaults, 'dbPath' ) );
			maybeAddDynamicPaths( newDb, dbPath )
			db = newDb;
			resolve( db );
		} );

	} else {
		db.settings.find( { key: 'dbPath' }, ( err, settings ) => {
			const dbPath = get( settings, [0, 'value'], get( settingsDefaults, 'dbPath' ) );
			maybeAddDynamicPaths( db, dbPath );
			resolve( db );
		} );
	}
} );

// init.
getDb();

module.exports = getDb;