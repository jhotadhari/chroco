import {
	isArray,
	isString,
} from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayOfYear from 'dayjs/plugin/dayOfYear';
dayjs.extend( utc );
dayjs.extend( timezone );
dayjs.extend( dayOfYear );

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

export const isValidDateInput = dateInputString => {
	const regex = /([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-2][0-9]):([0-5][0-9]):([0-5][0-9])/;
	if ( ! regex.test( dateInputString ) ) {
		return false;
	}
	const dateParsed = regex.exec( dateInputString );
	if (
		7 !== dateParsed.length
    || parseInt( dateParsed[2], 10 ) > 12   // month
    || parseInt( dateParsed[3], 10 ) > 31   // day
    || parseInt( dateParsed[4], 10 ) > 23   // hour
    || parseInt( dateParsed[5], 10 ) > 59   // minute
    || parseInt( dateParsed[6], 10 ) > 59   // second
	) {
		return false;
	}
	return true;
};

// same in chroco/public/utils.js
export const isValidTimezones = input => {
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

// same in chroco/public/utils.js
export const isValidRegex = input => {
	let valid = true;
	try {
		new RegExp( input );
	} catch( e ) {
		valid = false;
	}
	return valid;
};

// same in chroco/public/utils.js
export const getDateValuesForFilter = ( {
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