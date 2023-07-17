
const {
	existsSync,
	accessSync,
	constants,
} = require( 'fs' );
const {
	isArray,
	isString,
} = require( 'lodash' );
const path = require( 'path' );
const dayjs = require( 'dayjs' );
const utc = require( 'dayjs/plugin/utc' );
const timezone = require( 'dayjs/plugin/timezone' );
dayjs.extend( utc );
dayjs.extend( timezone );

/**
 * Check if path is existing and writable.
 * If not existing, check if parent is existing and writable.
 *
 */
const isPathValid = p => {

	if ( path.join( p, '..') === path.join( p ) ) {
		return false;	// is root
	}

	if ( existsSync( p ) ) {
		try {
			accessSync( p, constants.W_OK );
			return true;
		} catch ( err ) {
			return false;	// not writable
		}
	} else {
		return isPathValid( path.join( p, '..') );
	}
}

// same in fucking-simple-time-tracker/src/utils.js
const isValidTimezones = input => {
	if ( ! input
		|| ! input.length
		|| ( 1 === input.length && isArray( input ) && '' === input[0] )
	) {
		return true;
	}
	input = isString( input ) ? input.split( ',' ) : input;
	let valid = [...input].reduce( ( acc, tz ) => {
		if ( ! acc ) { return acc }
		try {
			dayjs().tz( tz );
			return true;
		}
		catch ( ex ) {
			return false;
		}
	}, true )
	return valid;
}

module.exports = {
    isPathValid,
    isValidTimezones,
};