import classnames from "classnames";
import {
  	get,
} from "lodash";
import {
  	useContext,
  	useState,
} from "react";
import Autosuggest from 'react-autosuggest';

import Context from '../Context';

const Input = ( {
	field,
	useDefault,
	timeSlot,
	updateTimeSlot,
	editTimeSlot,
	setEditTimeSlot,

} ) => {
	const {
		timeSlotSchema,
		setTimeSlots,
		timeSlots,
		fieldSuggestions,
		addFieldSuggestion,
	} = useContext( Context );
	const title = get( timeSlotSchema, [field,'title'], '' );
	const defaultVal = useDefault ? get( timeSlotSchema, [field, 'default'], '' ) : '';
	const isDirty = get( editTimeSlot, field, get( timeSlot, field ) ) !== get( timeSlot, field );
	const value = get( editTimeSlot, field, get( timeSlot, field, defaultVal ) );

	const hasSuggestions = get( timeSlotSchema, [field,'hasSuggestions'] );
	const [suggestions,setSuggestions] = useState( get( fieldSuggestions, field, [] ) );

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
						timeSlots,
						setTimeSlots,
						editTimeSlot,
						setEditTimeSlot,
						// includeFields: [field],	// ??? TODO Bug with group updateTimeSlots: other dirty fields loose their changes. Actually here it works fine, but disabled for now.
					} );
					addFieldSuggestion( editTimeSlot[field] );
					break;
				case 'Escape':
					const newEditTimeSlot = {...editTimeSlot}
					delete newEditTimeSlot[field];
					setEditTimeSlot( newEditTimeSlot );
					break;
			}
		}
	};

	if ( hasSuggestions ) {

		const getSuggestions = value => {
			// ??? TODO use regex .*value.*
			const inputValue = value.trim().toLowerCase();
			const inputLength = inputValue.length;
			const suggestions = get( fieldSuggestions, field, [] );

			return inputLength === 0
				? suggestions
				: suggestions.filter( suggestion =>
					suggestion.toLowerCase().slice( 0, inputLength ) === inputValue
				);
		};

		return <Autosuggest
			getSuggestionValue={ suggestion => suggestion }
			suggestions={ suggestions }
			onSuggestionsFetchRequested={ ( { value } ) => setSuggestions( getSuggestions( value ) ) }
			onSuggestionsClearRequested={ () => setSuggestions( [] ) }
			renderSuggestion={ suggestion => <span>{ suggestion }</span> }
			renderSuggestionsContainer={ ( { containerProps, children, query } ) => {
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
				onChange: ( event, { type, newValue } ) => {
					setEditTimeSlot( { ...editTimeSlot, [field]: newValue } );
				}
			} }
		/>;

	} else {
		return <input
			onKeyDown={ onKeyDown }
			className={ inputClassName }
			type="text"
			onChange={ ( e ) => {
				setEditTimeSlot( { ...editTimeSlot, [field]: e.target.value } );
			} }
			value={ value }
			title={ title }
			placeholder={ title }
		/>;
	}
};

export default Input;
