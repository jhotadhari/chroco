import classnames from 'classnames';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
	get,
	omit,
} from 'lodash';
import React, {
	useState,
	useContext,
} from 'react';
import Context from '../Context';
import TimezonesTooltip from './TimezonesTooltip.jsx';
import { dateFormat } from '../constants';
import { isValidDateInput } from '../utils';
import useTimeSlotCrud from '../hooks/useTimeSlotCrud';
dayjs.extend( utc );
dayjs.extend( timezone );

const DateInput = ( {
	field,
	timeSlot,
	editTimeSlot,
	setEditTimeSlot,
} ) => {
	const { getSetting } = useContext( Context );

	const { updateTimeSlot } = useTimeSlotCrud();

	const [
		tempVal, setTempVal,
	] = useState( false );
	const val = get( timeSlot, field )
		? dayjs( get( editTimeSlot, field, get( timeSlot, field ) ) ).format( dateFormat )
		: '';
	const isDirty = tempVal || ( get( editTimeSlot, field, get( timeSlot, field ) ) !== get( timeSlot, field ) );
	const title = get( getSetting( 'fields' ).find( f => f.key === field ), 'title', '' );

	const tooltipId = get( timeSlot, '_id' ) + '-' + field + '-' + Math.round( Math.random() * 100000 );

	return <>
		<input
			data-tooltip-id={ tooltipId }
			onKeyDown={ e => {
				if ( isDirty ) {
					switch( e.key ) {
						case 'Enter':
							updateTimeSlot( {
								timeSlot,
								editTimeSlot,
								setEditTimeSlot,
								// includeFields: [field],	// ??? TODO Bug with group updateTimeSlots: other dirty fields loose their changes. Actually here it works fine, but disabled for now.
							} );
							break;
						case 'Escape':
							setEditTimeSlot( omit( editTimeSlot, field ) );
							setTempVal( false );
							break;
					}
				}
			} }
			className={ classnames( {
				'form-control': true,
				'dirty': isDirty,
				'invalid': tempVal && ! isValidDateInput( tempVal ),
			} ) }
			type="text"
			disabled={ ! timeSlot[field] }
			onBlur={ () => {
				if ( tempVal && isValidDateInput( tempVal ) ) {
					setTempVal( false );
				}
			} }
			onChange={ ( e ) => {
				setTempVal( e.target.value );
				if ( isValidDateInput( e.target.value ) ) {
					setEditTimeSlot( {
						...editTimeSlot,
						[field]: dayjs( e.target.value ).valueOf(),
					} );
				}
			} }
			value={ tempVal ? tempVal : val }
			title={ title }
			placeholder={ dateFormat }
		/>

		<TimezonesTooltip
			tooltipId={ tooltipId }
			value={ tempVal ? tempVal : val }
		/>

	</>;
};

export default DateInput;