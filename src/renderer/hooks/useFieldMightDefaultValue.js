import { get } from 'lodash';
import { useContext } from 'react';
import Context from '../Context';

/**
 * Retrieve value, isDirty
 * ... and other stuff, that is actually not related to defaults but common for all components that use this hook.
 *
 */
const useFieldMightDefaultValue = ( {
	useDefault,
	fieldKey,
	timeSlot,
	editTimeSlot,
} ) => {

	const { getSetting } = useContext( Context );

	const fieldSchema = getSetting( 'fields' ).find( f => f.key === fieldKey );

	const defaultVal = useDefault && 0 !== get( fieldSchema, 'useDefault', 0 ) ? get( fieldSchema, 'default', '' ) : '';

	const isDirty = useDefault && ! timeSlot
		? get( editTimeSlot, fieldKey, defaultVal ) !== defaultVal
		: get( editTimeSlot, fieldKey, get( timeSlot, fieldKey ) ) !== get( timeSlot, fieldKey );

	const value = get( editTimeSlot, fieldKey, get( timeSlot, fieldKey, defaultVal ) );

	return {
		title: get( fieldSchema, 'title', '' ),
		isDirty,
		value,
	};
};

export default useFieldMightDefaultValue;
