import classnames from "classnames";
// import dayjs from "dayjs";
import {
  get,
//   isObject,
//   omit,
//   difference,
} from "lodash";
import {
	useState,
	useContext,
	// useEffect,
	Fragment,
	// useRef,
} from "react";
import { MultiSelect } from "react-multi-select-component";
// import Autosuggest from 'react-autosuggest';
import Context from '../Context';
// import {
// 	TimeSlot,
// 	stopTimeSlot,
// 	startTimeSlot,
// } from "./TimeSlot";
// import useTick from "../hooks/useTick";
// import { getFilteredSuggestions } from "./Input";
// import Icon from "./Icon";
import {
	// sortTimeSlotsCompare,
	// formatSeconds,
	isValidRegex,
} from "../utils";



const { api } = window;


const InputFilter = ( {
	field,
} ) => {

	const {
		getSetting,
		timeSlotSchema,
		themeSource,
		settings,
		setSettings,
	} = useContext( Context );

	const settingKey = 'filters';
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => get( sett, 'key' ) === settingKey ) : undefined;

	const doUpdate = newVal => {
		if ( undefined === setting ) {
			// add new setting
			const newSetting = {
				key: settingKey,
				value: newVal,
			};
			api.settings.add( newSetting ).then( ( addedSetting ) => {
				setSettings( [...settings, addedSetting] );
			} );
		} else {
			// update setting
			const newSetting = {
				...setting,
				value: newVal,
			};
			api.settings.update( newSetting ).then( numberUpdated => {
				if ( numberUpdated ) {
					const newSettings = [...settings];
					const idx = newSettings.findIndex( sett => sett._id === setting._id );
					newSettings.splice( idx, 1, newSetting );
					setSettings( newSettings );
				}
			} );
		}
	};

	const title = get( timeSlotSchema, [field,'title'], '' );
	const titlePlural = get( timeSlotSchema, [field,'titlePlural'], title );

	const options = [
		{
			value: 'all',
			label: 'All ' + titlePlural,
		},
		{
			value: 'include',
			label: 'Include ' + titlePlural + '',
		},
		{
			value: 'exclude',
			label: 'Exclude ' + titlePlural + '',
		},
	];

	const [editFilter,setEditFilter] = useState( {} );

	const filters = getSetting( 'filters' );
	const filterIdx = filters && Array.isArray( filters )
		? filters.findIndex( filter => filter.field === field )
		: -1;

	const filterSett = get( filters, filterIdx );
	const filter = {
		...( filterSett ? filterSett : {
			field,
		} ),
		...editFilter,
	};

	const selectedOption = filterIdx !== -1
		? options.find( opt => opt.value === filter.type )
		: options[0];

	const isFiltered = 'all' !== selectedOption.value;

	const isInputDirty = get( editFilter, 'value' ) && get( filterSett, 'value' ) !== get( editFilter, 'value' );

	return <div
	  key={ field }
	  className={ classnames( [
		'timeSlot--filter',
		'title' === field ? 'col-9' : 'col',
		'position-relative',

		isFiltered ? '' : 'unfiltered'
	  ] ) }
	>
		<div
			className={ classnames( [
				'position-relative',
				'w-100',
			] ) }
		>
			<MultiSelect
				className={ themeSource }
				hasSelectAll={ false }
				disableSearch={ true }
				closeOnChangedValue={ true }
				options={ options }
				value={ [selectedOption] }
				onChange={ res => {
					if ( 0 === res.length ) {
						res = [options[0]]
					}
					if ( 2 === res.length ) {
						// remove old value
						res = [...res].filter( opt => opt.value !== selectedOption.value );
					}
					if ( 1 !== res.length ) {
						return;
					}
					if ( options.find( opt => opt.value === res[0].value ) ) {
						let newFilter = {};
						let newFilters = [...filters];
						if ( 'all' === res[0].value ) {
							if ( filterIdx !== -1 ) {
								newFilter = {}
								newFilters.splice( filterIdx, 1 );
							}
						} else {
							if ( filterIdx === -1 ) {
								newFilter = {
									...filter,
									type: res[0].value,
									value: '',
								};
								newFilters = [
									...newFilters,
									newFilter
								];
							} else {
								newFilter = {
									...filter,
									type: res[0].value,
								};
								newFilters[filterIdx] = newFilter;
							}
						}
						setEditFilter( newFilter );
						doUpdate( newFilters );
					}
				} }
			/>

			{ isFiltered && <input
				onKeyDown={ e => {
					switch( e.key ) {
						case 'Escape':
							setEditFilter( {} );
							if ( ! get( editFilter, 'value', [] ).length && ! get( filterSett, 'value', [] ).length ) {
								if ( filterIdx !== -1 ) {
									let newFilters = [...filters];
									newFilters.splice( filterIdx, 1 );
									doUpdate( newFilters );
								}
							}
							break;
						case 'Enter':
							if ( isValidRegex( filter.value ) ) {
								let newFilters = [...filters];
								newFilters[filterIdx] = {...filter};
								doUpdate( newFilters );
							}
							break;
					}
				} }
				className={ classnames( {
					'form-control': true,
					'mt-2': true,
					'dirty': isInputDirty,
					'invalid': ! isValidRegex( get( filter, 'value', '' ) )
				} ) }
				type="text"
				onChange={ ( e ) => {
					if ( filterIdx !== -1 ) {
						let newFilter = {
							...filter,
							value: e.target.value,
						};
						setEditFilter( newFilter );
					}
				} }
				value={ get( filter, 'value', '' ) }
				title={ 'Filter ' + timeSlotSchema[field].title + ' by RegExp' }
				placeholder={ 'regex' }
			/> }
		</div>
	</div>
}

const TimeSlotsFilters = () => {

	const {
		getSetting,
		timeSlotSchema,
	} = useContext( Context );

  	return <div className='container-fluid mb-5 timeSlots-filters' >
		<div className="row">
			<div className="col">
				{ 'Filter records' }
			</div>
		</div>
		<div className="row">

			<div className="col-1"></div>

			{ !! timeSlotSchema ? Object.keys( timeSlotSchema ).filter( field => ! [
				...getSetting( 'hideFields' ),
				'_id',
			].includes( field ) ).map( field => {
				if ( 'text' !== timeSlotSchema[field].type ) {
					return <div key={ field } className="col">
						{/* nix??? */}
					</div>
				}
				return <InputFilter
					key={ field }
					field={ field }
				/>
			} ) : '' }

			<div className="col-3">
				{/* spacer??? */}
			</div>

			<div className="col-4">
				{/* per_page??? */}
			</div>

		</div>
	</div> ;
};

export default TimeSlotsFilters;