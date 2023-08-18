import classnames from 'classnames';
import { omit } from 'lodash';
import React from 'react';
import useTimeSlotCrud from '../hooks/useTimeSlotCrud';
import useFieldMightDefaultValue from '../hooks/useFieldMightDefaultValue';

const ToggleBool = ( {
	field,
	useDefault,
	timeSlot,
	editTimeSlot,
	setEditTimeSlot,
} ) => {
	const { updateTimeSlot } = useTimeSlotCrud();

	const {
		title,
		isDirty,
		value,
	} = useFieldMightDefaultValue( {
		useDefault,
		fieldKey: field,
		timeSlot,
		editTimeSlot,
	} );

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
