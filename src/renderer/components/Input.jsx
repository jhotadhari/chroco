import classnames from 'classnames';
import {
  	get,
  	omit,
} from 'lodash';
import React, {
  	useContext,
  	useState,
} from 'react';
import Autosuggest from 'react-autosuggest';
import Context from '../Context';
import useTimeSlotCrud from '../hooks/useTimeSlotCrud';
import useFieldMightDefaultValue from '../hooks/useFieldMightDefaultValue';

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
		getSetting,
		fieldSuggestions,
		addFieldSuggestion,
	} = useContext( Context );

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

	const hasSuggestions = get(
		getSetting( 'fields' ).find( f => f.key === field ),
		'hasSuggestions',
		false,
	);
	const [
		suggestions, setSuggestions,
	] = useState( get( fieldSuggestions, field, [] ) );

	const inputClassName = classnames( {
		'form-control': true,
		'dirty': isDirty,
	} );

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
