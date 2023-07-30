import classnames from 'classnames';
import {
  	get,
  	omit,
} from 'lodash';
import {
  	useContext,
  	useEffect,
  	useState,
} from 'react';
import Autosuggest from 'react-autosuggest';
import Context from '../Context';
import useTimeSlotCrud from '../hooks/useTimeSlotCrud';

export const getFilteredSuggestions = ( value, suggestions ) => {
	const inputValue = value.trim().toLowerCase();
	const inputLength = inputValue.length;
	const regex = new RegExp( '.*?' + inputValue + '.*?', 'g' );
	return inputLength === 0
		? suggestions
		: suggestions.filter( suggestion => {
			const result = regex.test( suggestion.toLowerCase() );
			return result;

		} );
};

const Input = ( {
	field,
	useDefault,
	timeSlot,
	editTimeSlot,
	setEditTimeSlot,
} ) => {
	const {
		timeSlotSchema,
		fieldSuggestions,
		addFieldSuggestion,
	} = useContext( Context );

	const {updateTimeSlot} = useTimeSlotCrud();

	const title = get( timeSlotSchema, [
		field, 'title',
	], '' );
	const defaultVal = useDefault ? get( timeSlotSchema, [
		field, 'default',
	], '' ) : '';
	const isDirty = get( editTimeSlot, field, get( timeSlot, field ) ) !== get( timeSlot, field );
	const value = get( editTimeSlot, field, get( timeSlot, field, defaultVal ) );

	const hasSuggestions = get( timeSlotSchema, [
		field, 'hasSuggestions',
	] );
	const [
		suggestions, setSuggestions,
	] = useState( get( fieldSuggestions, field, [] ) );

	const inputClassName = classnames( {
		'form-control': true,
		'dirty': isDirty,
	} );

	// Apply defaultVal to editTimeSlot.
	useEffect( () => {
		if ( useDefault
			&& value
			&& value === defaultVal
			&& ! ( get( timeSlot, field ) || get( editTimeSlot, field ) )
		) {
			setEditTimeSlot( {
				...editTimeSlot, [field]: value,
			} );
		}
	}, [
		timeSlot, editTimeSlot,
	] );

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
					if ( hasSuggestions ) {
						addFieldSuggestion( editTimeSlot[field] );
					}
					break;
				case 'Escape':
					setEditTimeSlot( omit( editTimeSlot, field ) );
					break;
			}
		}
	};

	if ( hasSuggestions ) {

		return <Autosuggest
			getSuggestionValue={ suggestion => suggestion }
			suggestions={ suggestions }
			onSuggestionsFetchRequested={ ( { value } ) => setSuggestions( getFilteredSuggestions( value, get( fieldSuggestions, field, [] ) ) ) }
			onSuggestionsClearRequested={ () => setSuggestions( [] ) }
			renderSuggestion={ suggestion => <span>{ suggestion }</span> }
			renderSuggestionsContainer={ ( {
				containerProps, children, query,
			} ) => {
				const props = {
					...containerProps,
					className: classnames( [
						containerProps.className,
						'position-absolute',
						'shadow',
						'list-unstyled',
						'border',
						'border-1',
						'bg-body-tertiary',
						'z-1',
						'px-0',
						'py-0',
					] ),
				};
				return <div { ...props }>
					{children}
				</div>;
			} }
			inputProps={ {
				title: title,
				placeholder: title,
				className: inputClassName,
				value,
				onKeyDown,
				onChange: ( event, {
					type, newValue,
				} ) => {
					setEditTimeSlot( {
						...editTimeSlot, [field]: newValue,
					} );
				},
			} }
		/>;

	} else {
		return <input
			onKeyDown={ onKeyDown }
			className={ inputClassName }
			type="text"
			onChange={ ( e ) => {
				setEditTimeSlot( {
					...editTimeSlot, [field]: e.target.value,
				} );
			} }
			value={ value }
			title={ title }
			placeholder={ title }
		/>;
	}
};

export default Input;
