
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
const dayOfYear = require( 'dayjs/plugin/dayOfYear' );
dayjs.extend( utc );
dayjs.extend( timezone );
dayjs.extend( dayOfYear );

/**
 * Check if path is existing and writable.
 * If not existing, check if parent is existing and writable.
 *
 */
const isPathValid = p => {

	if ( path.join( p, '..' ) === path.join( p ) ) {
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
		return isPathValid( path.join( p, '..' ) );
	}
};

const parseSerialized = ( str, fallback ) => {
	fallback = fallback ? fallback : fallback;
	let object = fallback;
	try {
		object = JSON.parse( str );
	} catch( e ) {
		console.log( e );
		object = object;
	}
	return object;
};

// same in chroco/src/renderer//utils.js
const isValidTimezones = input => {
	if ( ! input
		|| ! input.length
		|| ( 1 === input.length && isArray( input ) && '' === input[0] )
	) {
		return true;
	}
	input = isString( input ) ? input.split( ',' ) : input;
	let valid = [...input].reduce( ( acc, tz ) => {
		if ( ! acc ) {
			return acc;
		}
		try {
			dayjs().tz( tz );
			return true;
		} catch ( ex ) {
			return false;
		}
	}, true );
	return valid;
};

// same in chroco/src/renderer//utils.js
const isValidRegex = input => {
	let valid = true;
	try {
		new RegExp( input );
	} catch( e ) {
		valid = false;
	}
	return valid;
};

// same in chroco/src/renderer//utils.js
const getDateValuesForFilter = ( {
	timeFrame, value, startOfWeek,
} ) => {
	let inputValue;
	switch( timeFrame ) {
		case 'week':
			inputValue = dayjs().day( startOfWeek );
			if ( parseInt( startOfWeek, 10 ) > parseInt( dayjs().day(), 10 ) ) {
				inputValue = inputValue.add( -1, 'week' );
			}
			break;
		case 'month':
			inputValue = dayjs().date( 1 );
			break;
		case 'year':
			inputValue = dayjs().dayOfYear( 1 );
			break;
	}
	inputValue = {
		from: inputValue.set( 'second', 0 ).set( 'minute', 0 )
			.set( 'hour', 0 )
			.add( value, timeFrame )
			.valueOf(),
		to: inputValue.set( 'second', 59 ).set( 'minute', 59 )
			.set( 'hour', 23 )
			.add( value + 1, timeFrame )
			.add( -1, 'day' )
			.valueOf(),
	};
	return inputValue;
};

module.exports = {
	isPathValid,
	parseSerialized,
	isValidTimezones,
	isValidRegex,
	getDateValuesForFilter,
};