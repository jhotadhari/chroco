import {
    isArray,
    isString,
} from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend( utc );
dayjs.extend( timezone );


export const sortTimeSlotsCompare = ( timeSlotA, timeSlotB ) => {
    if ( timeSlotA.dateStart > timeSlotB.dateStart ) {
        return -1;
    }
    if ( timeSlotA.dateStart < timeSlotB.dateStart ) {
      return 1;
    }
    return 0;
};

export const formatSeconds = seconds => {
    let isNeg = false;
    if ( seconds < 0 ) {
        isNeg = true;
        seconds = seconds * ( -1 );
    }
    let d = Number( seconds );
    let h = Math.floor( d / 3600 );
    let m = Math.floor( d % 3600 / 60 );
    let s = Math.floor( d % 3600 % 60 );
    return ( isNeg ? '- ' : '' ) + ( h ? h + ' h ' : '' ) + m + ' m ' + s + ' s';
};

// same in fucking-simple-time-tracker/public/utils.js
export const isValidTimezones = input => {
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

// same in fucking-simple-time-tracker/public/utils.js
export const isValidRegex = input => {
	let valid = true;
	try {
		new RegExp( input );
	} catch( e ) {
		valid = false;
	}
	return valid;
}