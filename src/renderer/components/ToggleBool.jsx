import classnames from 'classnames';
import {
  	get,
  	omit,
} from 'lodash';
import React, { useContext } from 'react';
import Context from '../Context';
import useTimeSlotCrud from '../hooks/useTimeSlotCrud';

const ToggleBool = ( {
	field,
	useDefault,
	timeSlot,
	editTimeSlot,
	setEditTimeSlot,
} ) => {
	const { getSetting } = useContext( Context );

	const { updateTimeSlot } = useTimeSlotCrud();

	const fieldSchema = getSetting( 'fields' ).find( f => f.key === field );
	const title = get( fieldSchema, 'title', '' );
	const defaultVal = useDefault && 0 !== get( fieldSchema, 'useDefault', 0 ) ? get( fieldSchema, 'default', '' ) : '';

	const isDirty = get( editTimeSlot, field, get( timeSlot, field ) ) !== get( timeSlot, field );
	const value = get( editTimeSlot, field, get( timeSlot, field, defaultVal ) );

	const inputClassName = classnames( {
		'form-check-input': true,
		'dirty': isDirty,
	} );

	const checked = value && '0' != value;

	const onKeyDown = e => {
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
					break;
			}
		}
	};

	return <div className="form-check form-switch">
		<input
			title={ title }
			onKeyDown={ onKeyDown }
			className={ inputClassName }
			type="checkbox"
			role="switch"
			checked={ checked }
			onChange={ () => {
				setEditTimeSlot( {
					...editTimeSlot, [field]: checked ? '0' : '1',
				} );
			} }
		/>
	</div>;

};

export default ToggleBool;
