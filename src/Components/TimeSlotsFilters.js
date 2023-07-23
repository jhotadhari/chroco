import classnames from "classnames";
import dayjs from "dayjs";
import {
	isInteger,
	set,
  	get,
} from "lodash";
import {
	useState,
	useContext,
	Fragment,
} from "react";
import { MultiSelect } from "react-multi-select-component";
import Context from '../Context';
import { dateFormat } from '../constants';
import TimezonesTooltip from "./TimezonesTooltip";
import Icon from "./Icon";
import {
	isValidDateInput,
	getDateValuesForFilter,
	isValidRegex,
} from "../utils";
const { api } = window;

export const useDoUpdate = ( {
	settingKey
} ) => {
	const {
		settings,
		setSettings,
	} = useContext( Context );

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

	return doUpdate;
}

const DateStartFilter = ( {
	field,
} ) => {

	const {
		getSetting,
		themeSource,
	} = useContext( Context );

	const settingKey = 'filters';
	const doUpdate = useDoUpdate( { settingKey } );

	let options = [
		{
			value: 'custom',
			label: 'Custom date filter',
		},
		{
			value: 'week',
			label: {
				singular: 'week',
				plural: 'weeks',
			},
		},
		{
			value: 'month',
			label: {
				singular: 'month',
				plural: 'months',
			},
		},
		{
			value: 'year',
			label: {
				singular: 'year',
				plural: 'years',
			},
		},
	];

	const [editFilter,setEditFilter] = useState( {} );

	const filters = getSetting( 'filters' );
	const filterIdx = filters && Array.isArray( filters )
		? filters.findIndex( filter => filter.field === field )
		: -1;

	const filterSett = get( filters, filterIdx );
	const filterBase = {
		...( filterSett ? filterSett : {
			field,
		} )
	};
	const filter = {
		...filterBase,
		...editFilter,
	};

	const selectedOption = filterIdx !== -1
		? options.find( opt => opt.value === filter.type )
		: options[1];	// week

	// Change options labels
	options = [...options].map( opt => {
		let label = opt.label;
		if ( 'custom' !== opt.value ) {
			if ( opt.value === get( filter, 'type' ) ) {
				const val = get( filter, 'value' );
				switch( true ) {
					case ( 0 === val ):
						label = 'This ' + opt.label.singular;
						break;
					case ( 0 < val ):
						label = val + ' ' +  ( 1 !== val ? opt.label.plural : opt.label.singular ) + ' ahead';
						break;
					case ( 0 > val ):
						label = Math.abs( val ) + ' ' + ( -1 !== val ? opt.label.plural : opt.label.singular ) + ' ago';
						break;
				}
			} else {
				label = 'This ' + opt.label.singular;
			}
		}
		return {
			...opt,
			label: get( label, 'singular', label ),
		};
	} );

	/**
	 * Value for input fields. In unix timestamps.
	 *
	 * return {
	 * 	from: Unix Timestamp (milliseconds),
	 * 	to: Unix Timestamp (milliseconds),
	 * }
	 */
	let inputValue;
	const filterType = get( filter, 'type', selectedOption.value );
	if ( filterType === 'custom' ) {
		inputValue = {
			from: dayjs( get( filter, ['value','from'] ) ).valueOf(),
			to: dayjs( get( filter, ['value','to'] ) ).valueOf(),
		};
	} else {
		inputValue = getDateValuesForFilter( { timeFrame: filterType, value: get( filter, 'value', 0 ) } );
	}

	/**
	 * Get the formatted value for input field.
	 *
	 * Maybe get editing value or format stored unix timestamp.
	 *
	 * @param   string  key     from|to
	 */
	const getInputValueEdit = key => {
		if ( null !== get( editFilter, ['value',key], null ) ) {
			if ( /^\d+$/.test( get( editFilter, ['value',key], '' ) ) ) {
				return dayjs( get( editFilter, ['value',key] ) ).format( dateFormat );
			} else {
				return get( editFilter, ['value',key] );
			}
		} else {
			return dayjs( inputValue[key] ).format( dateFormat )
		}
	};

	/**
	 * Get className for input field.
	 *
	 * @param   string  key     from|to
	 */
	const getInputClassName = key => classnames( {
		'form-control': true,
		'mt-2': true,
		'dirty': get( editFilter, ['value',key] ) && ! /^\d+$/.test( get( editFilter, ['value',key] ) ),
		'invalid': ! isValidDateInput( getInputValueEdit( key ) ),
	} );

	/**
	 * callback MultiSelect onChange
	 *
	 * @param   array  res     New selected options
	 */
	const onChangeMultiSelect = res => {
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
			if ( 'custom' === res[0].value ) {
				newFilter = {
					...filter,
					type: res[0].value,
					value: {...inputValue},
				};
				if ( filterIdx === -1 ) {
					newFilters = [
						...newFilters,
						newFilter
					];
				} else {
					newFilters[filterIdx] = newFilter;
				}
			} else {
				newFilter = {
					...filter,
					type: res[0].value,
					value: 0,
				};
				if ( filterIdx === -1 ) {
					newFilters = [
						...newFilters,
						newFilter
					];
				} else {
					newFilters[filterIdx] = newFilter;
				}
			}
			setEditFilter( newFilter );
			doUpdate( newFilters );
		}
	};

	/**
	 * callback button onClick
	 *
	 * @param   string  direction     prev|next
	 */
	const onClickNavBtn = direction => {
		if ( 'custom' !== get( filter, 'value' ) ) {
			let newFilters = [...filters];
			if ( filterIdx !== -1 ) {
				let newFilter = {...filter};
				newFilter.value = get( newFilter, 'value', 0 );
				newFilter.value = isInteger( newFilter.value ) ? newFilter.value : 0;
				switch( direction ) {
					case 'prev':
						newFilter.value = newFilter.value - 1;
						break;
					case 'next':
						newFilter.value = newFilter.value + 1;
						break;
				}
				newFilters[filterIdx] = newFilter;
				setEditFilter( newFilter );
				doUpdate( newFilters );
			}
		}
	}

	/**
	 * callback input onChange
	 *
	 * @param   string  newVal  New input value
	 * @param   string  key     from|to
	 */
	const onChangeInput = ( newVal, key ) => {
		let newEditFilter = {
			...filter,
			type: 'custom',
			value: {
				...inputValue,
				...get( editFilter, 'value', {} ),
				[key]: newVal,
			},
		};
		setEditFilter( newEditFilter );
	};

	/**
	 * callback input onKeyDown
	 *
	 * @param   object  e  		event
	 * @param   string  key     from|to
	 */
	const onKeyDownInput = ( e, key ) => {
		if ( get( editFilter, ['value','from'] )
			|| get( editFilter, ['value','to'] )
		) {
			let newEditFilter;
			switch( e.key ) {
				case 'Escape':
					const valSett = get( filterSett, ['value',key] );
					if ( valSett ) {
						newEditFilter = {...editFilter}
						set( newEditFilter, ['value',key], valSett );
						setEditFilter( newEditFilter );
					}
					break;
				case 'Enter':
					let newFilter = {...filter};
					let newFilters = [...filters];

					if ( ! Object.keys( newFilter.value ).reduce( ( valid, k ) => {
						return valid && ! /^\d+$/.test( newFilter.value[k] )
							? isValidDateInput( newFilter.value[k] )
							: valid;
					}, true ) ) {
						return;
					}

					Object.keys( newFilter.value ).map( k => {
						if ( ! /^\d+$/.test( newFilter.value[k] ) ) {
							newFilter.value[k] = dayjs( newFilter.value[k] ).valueOf();
						}
					} );

					if ( filterIdx === -1 ) {
						newFilters = [
							...newFilters,
							newFilter
						];
					} else {
						newFilters[filterIdx] = newFilter;
					}
					doUpdate( newFilters );
					break;
			}
		}
	};

	return <div
		className={ classnames( [
			'timeSlot--filter',
			'timeSlot--filter--' + field,
			'col-8',
			'position-relative',
			'd-block',
		] ) }
	>

		<div className="row actions" >
			<div className="col">
				<button
					disabled={ 'custom' === get( filter, 'type' ) }
					type='button'
					className={ 'btn border-0' }
					title={ 'One ' + selectedOption.label.singular + ' to the past' }
					onClick={ () => onClickNavBtn( 'prev' ) }
				>
					<Icon type='caret-left'/>
				</button>
			</div>

			<div className="col">
				<MultiSelect
					ClearSelectedIcon={ null }
					className={ classnames( [ themeSource, 'w-100', 'text-center' ] ) }
					hasSelectAll={ false }
					disableSearch={ true }
					closeOnChangedValue={ true }
					options={ options }
					value={ [{
						...selectedOption,
						label: options.find( opt => opt.value === selectedOption.value ).label,
					}] }
					onChange={ onChangeMultiSelect }
				/>
			</div>

			<div className="col">
				<button
					type='button'
					title={ 'One ' + selectedOption.label.singular + ' to the future' }
					disabled={ 'custom' === get( filter, 'type' ) || get( filter, 'value', 0 ) >= 0 }
					className={ 'btn border-0' }
					onClick={ () => onClickNavBtn( 'next' ) }
				>
					<Icon type='caret-right'/>
				</button>
			</div>
		</div>

		<div className="row">
			<div className="col">
				<input
        			data-tooltip-id={ 'filter--' + field + '--from' }
					onKeyDown={ e => onKeyDownInput( e, 'from' ) }
					className={ getInputClassName( 'from' ) }
					value={ getInputValueEdit( 'from' ) }
					onChange={ e => onChangeInput( e.target.value, 'from' ) }
				/>
				<TimezonesTooltip
        			tooltipId={ 'filter--' + field + '--from' }
				  	value={ getInputValueEdit( 'from' ) }
				/>
			</div>
			<div className="col">
				<input
        			data-tooltip-id={ 'filter--' + field + '--to' }
					onKeyDown={ e => onKeyDownInput( e, 'to' ) }
					className={ getInputClassName( 'to' ) }
					value={ getInputValueEdit( 'to' ) }
					onChange={ e => onChangeInput( e.target.value, 'to' ) }
				/>
				<TimezonesTooltip
        			tooltipId={ 'filter--' + field + '--to' }
				  	value={ getInputValueEdit( 'to' ) }
				/>
			</div>
		</div>

	</div>;
};

const InputFilter = ( {
	field,
} ) => {

	const {
		getSetting,
		timeSlotSchema,
		themeSource,
	} = useContext( Context );

	const settingKey = 'filters';
	const doUpdate = useDoUpdate( { settingKey } );

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
	//   key={ field }
	  className={ classnames( [
		'timeSlot--filter',
		'timeSlot--filter--' + field,
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
				placeholder={ 'RegExp' }
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
					switch( field ) {
						case 'dateStart':
							return <DateStartFilter
								key={ field }
								field={ field }
							/>
						default:
							return <Fragment key={ field }/>;
					}
				}
				return <InputFilter
					key={ field }
					field={ field }
				/>
			} ) : '' }

			<div className="col-3"></div>

			<div className="col-4"></div>

		</div>
	</div> ;
};

export default TimeSlotsFilters;