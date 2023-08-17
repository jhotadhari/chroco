import classnames from 'classnames';
import dayjs from 'dayjs';
import {
	get,
	set,
	isObject,
	omit,
} from 'lodash';
import React, {
	useState,
	useContext,
	Fragment,
} from 'react';
import Autosuggest from 'react-autosuggest';
import Context from '../Context';
import { dateFormat } from '../constants';
import useTimeSlotCrud from '../hooks/useTimeSlotCrud';
import useTick from '../hooks/useTick';
import TimeSlot from './TimeSlot.jsx';
import { getFilteredSuggestions } from './Input.jsx';
import { getOptionsGroupingAll } from './GroupingControl.jsx';
import Icon from './Icon.jsx';
import {
	sortTimeSlotsCompare,
	formatSeconds,
} from '../utils';
const { api } = window;

const GroupToggleBool = ( {
	field,
	timeSlot,
	updateTimeSlots,
	editTimeSlot,
	setEditTimeSlot,
} ) => {

	const { getSetting } = useContext( Context );

	const fieldSchema = getSetting( 'fields' ).find( f => f.key === field );
	const title = get( fieldSchema, 'title', '' );

	const isDirty = get( editTimeSlot, field, get( timeSlot, field ) ) !== get( timeSlot, field );
	const value = get( editTimeSlot, field, get( timeSlot, field, '0' ) );

	const inputClassName = classnames( {
		'form-check-input': true,
		'dirty': isDirty,
	} );

	const checked = value && '0' != value;

	const onKeyDown = e => {
		if ( isDirty ) {
			switch( e.key ) {
				case 'Enter':
					updateTimeSlots( {
						// includeFields: [field],	// ??? TODO Bug: other dirty fields loose their changes.
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

const GroupInput = ( {
	field,
	timeSlot,
	updateTimeSlots,
	editTimeSlot,
	setEditTimeSlot,
} ) => {

	const {
		fieldSuggestions,
		addFieldSuggestion,
		getSetting,
	} = useContext( Context );

	const fieldSchema = getSetting( 'fields' ).find( f => f.key === field );
	const title = get( fieldSchema, 'title', '' );
	const hasSuggestions = get( fieldSchema, 'hasSuggestions', '' );
	const value = get( editTimeSlot, field, get( timeSlot, field, '' ) );
	const isDirty = get( editTimeSlot, field, get( timeSlot, field ) ) !== get( timeSlot, field );

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
					updateTimeSlots( {
						// includeFields: [field],	// ??? TODO Bug: other dirty fields loose their changes.
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

const GroupDuration = ( { timeSlotsSlice } ) => {

	const {
		timeSlotCurrent,
		timeSlotCurrentEdit,
	} = useContext( Context );

	useTick( timeSlotCurrent
		? !! timeSlotsSlice.find( ts => ts._id === timeSlotCurrent._id )
		: undefined,
	);

	let isDirty = false;
	const seconds = [...timeSlotsSlice].reduce( ( acc, timeSlot ) => {
		const isCurrent = timeSlotCurrent && timeSlot._id === timeSlotCurrent._id;
		if ( isCurrent ) {
			isDirty = get( timeSlotCurrentEdit, 'dateStart', get( timeSlotCurrent, 'dateStart' ) ) !== get( timeSlotCurrent, 'dateStart' );
		}
		const start = isCurrent
			? get( timeSlotCurrentEdit, 'dateStart', get( timeSlotCurrent, 'dateStart' ), timeSlot.dateStart )
			: timeSlot.dateStart;
		const stop = isCurrent
			? dayjs()
			: get( timeSlot, 'dateStop', dayjs() );
		return start && stop
			? acc + dayjs( stop ).diff( dayjs( start ), 'second' )
			: acc;
	}, 0 );

	return <div
		className={ classnames( {
			'timeSlot--duration': true,
			'text-end': true,
			'align-middle': true,
			'bg-transparent': true,
			'col-3': true,
			'd-flex': true,
			'justify-content-end': true,
	  } ) }
	>
		<span
			className={ classnames( {
		  invalid: seconds < 0,
		  'p-2': true,
		  'dirty': isDirty,
			} ) }
		>
			{ false !== seconds
		  ? formatSeconds( seconds )
		  : '- m' }
		</span>
	</div>;
};

const GroupHeader = ( {
	timeSlotsSlice,
	expanded,
	setExpanded,
	timeSlotsSliceCurrents,
} ) => {

	const {
		setTimeSlots,
		setTimeSlotCurrentEdit,
		timeSlots,
		getSetting,
	} = useContext( Context );

	const {
		startTimeSlot,
		stopTimeSlot,
	} = useTimeSlotCrud();

	const [
		editTimeSlot, setEditTimeSlot,
	] = useState( {} );

	const updateTimeSlots = ( { includeFields } ) => {
		let newTimeSlots = [...timeSlots];
		return [...timeSlotsSlice].reduce( ( accumulatorPromise, timeSlot, index ) => {
			return accumulatorPromise.then( () => {
				return new Promise( ( resolve, reject ) => {
					let newEditTimeSlot = {};
					let newTimeSlot = { ...timeSlot };
					if ( includeFields ) {
						Object.keys( editTimeSlot ).map( key => {
							if ( includeFields.includes( key ) ) {
								newTimeSlot[key] = editTimeSlot[key];
							} else {
								newEditTimeSlot[key] = editTimeSlot[key];
							}
						} );
					} else {
						newTimeSlot = {
							...newTimeSlot,
							...editTimeSlot,
						};
					}
					api.timeSlots.update( newTimeSlot ).then( numberUpdated => {
						if ( numberUpdated ) {
							const idx = newTimeSlots.findIndex( ts => ts._id === newTimeSlot._id );
							newTimeSlots.splice( idx, 1, newTimeSlot );
							if ( timeSlotsSlice.length === index + 1 ) {
								setTimeSlots( newTimeSlots );
								setEditTimeSlot( newEditTimeSlot );
							}
						}
						resolve( true );
					} );
				} );
			} ).catch( err => console.log( err ) );
		}, Promise.resolve() );
	};

	return <div
		className={ classnames( [
			'row',
			'timeslot-group',
			! expanded && timeSlotsSliceCurrents.length > 0 ? 'highlight' : '',
		] ) }
	>
		<div className="col-1">
			 <button
				className="btn border-0 d-flex align-items-center"
				onClick={ () => setExpanded( ! expanded ) }
				title={ expanded ? 'Collapse' : 'Expand' }
			 >
				<span className="group-count">
					{ timeSlotsSlice.length }
				</span>
				{ expanded && <Icon type='caret-down' /> }
				{ ! expanded && <Icon type='caret-right' /> }
			</button>
		</div>

		{ <>

			{ getSetting( 'fields' ).filter( field => 'date' !== field.type && '_id' !== field.key )
				.map( field => {
					switch( field.type ) {
						case 'text':
							return <div
								key={ field.key }
								className={ classnames( [
									'timeSlot--' + field.key,
									'title' === field.key ? 'col-9' : 'col',
									'position-relative',
								] ) }
							>
								<GroupInput
									field={ field.key }
									timeSlot={ timeSlotsSlice[0] }
									updateTimeSlots={ updateTimeSlots }
									editTimeSlot={ editTimeSlot }
									setEditTimeSlot={ setEditTimeSlot }
								/>
							</div>;

						case 'bool':
							return <div
								key={ field.key }
								className={ 'col-1 timeSlot--' + field.key }
							><GroupToggleBool
									field={ field.key }
									timeSlot={ timeSlotsSlice[0] }
									updateTimeSlots={ updateTimeSlots }
									editTimeSlot={ editTimeSlot }
									setEditTimeSlot={ setEditTimeSlot }
								/></div>;
						default:
							return null;
					}
				} ) }

			<div className="col-4"></div>
			<div className="col-4"></div>

			<GroupDuration
				timeSlotsSlice={ timeSlotsSlice }
			/>

			<div className={ 'col-4 timeSlot--actions d-flex' }>
				<button
					className="btn me-2 save"
					onClick={ updateTimeSlots }
					disabled={ ! isObject( editTimeSlot ) || ! Object.keys( editTimeSlot ).length }
					title="Save"
				>
					<Icon type='save' />
				</button>

				<button
					type='button'
					className={ 'btn me-2 ' + ( timeSlotsSliceCurrents.length ? 'stop' : 'start' ) }
					onClick={ () => {
						if ( timeSlotsSliceCurrents.length ) {
							// stop all, should be max one.
							[...timeSlotsSliceCurrents].map( timeSlot => stopTimeSlot( { timeSlot } ) );
							setTimeSlotCurrentEdit( {} );
						} else {
							// start new one
							startTimeSlot( {
								timeSlot: timeSlotsSlice[0], maybeForceDefaults: true,
							} );
						}
					} }
					title={ timeSlotsSliceCurrents.length ? 'Stop' : 'Start' }
				>
					{ 0 == timeSlotsSliceCurrents.length && <Icon type='play' /> }
					{ timeSlotsSliceCurrents.length > 0 && <Icon type='stop' /> }
				</button>
			</div>

		</> }
	</div>;
};

const DateGroup = ( { timeSlotsSlice } ) => {
	const timeSlotsSliceCurrents = timeSlotsSlice.filter( ts => ! ts.dateStop );
	const [
		expanded, setExpanded,
	] = useState( !! timeSlotsSliceCurrents.length );

	return <>
		{ timeSlotsSlice.length > 1 && <GroupHeader
			timeSlotsSliceCurrents={ timeSlotsSliceCurrents }
			expanded={ expanded }
			setExpanded={ setExpanded }
			timeSlotsSlice={ timeSlotsSlice }
		/> }
		{ ( timeSlotsSlice.length === 1 || expanded ) && [...timeSlotsSlice].map( ( timeSlot, index ) => (
			<TimeSlot
				key={ timeSlot._id }
				timeSlot={ timeSlot }
			/>
		) ) }

		<div className="row spacer">
			<div className='col'></div>
		</div>
	</>;
};

// Sort timeSlotsGrouped. The deepest nested array is the timeSlots, sort by date..
const sortTimeSlotsGrouped = ( timeSlotsGrouped, grouped, path ) => {
	path = path || [];
	grouped = grouped || timeSlotsGrouped;
	Object.keys( grouped ).map( groupId => {
		const newPath = [...path,groupId];
		if ( Array.isArray( grouped[groupId] ) ) {
			set( timeSlotsGrouped, newPath, get( timeSlotsGrouped, newPath, [] ).sort( sortTimeSlotsCompare ) );
		} else {
			sortTimeSlotsGrouped( timeSlotsGrouped, grouped[groupId], newPath );
		}
	} );
};

const TimeSlotsTable = () => {

	const {
		timeSlots,
		getSetting,
	} = useContext( Context );

	const[shouldGroupDays,setShouldGroupDays] = useState( true )

	let groups = getSetting( 'groups' );
	groups = groups.filter( g => 'restFields' === g.id || ( g.fields && g.fields.includes( 'dateStartDay' ) ) );	// TODO ??? For now, the control is just a mockup, skip some groups.
	const { optionsGroupingKeysRemaining } = getOptionsGroupingAll( getSetting, groups );
	const timeSlotsGrouped = {};
	[...timeSlots].map( ( timeSlot ) => {
		const groupIds = [...groups].map( ( group, groupIdx ) => {
			let groupId;
			if ( 'restFields' !== group.id ) {
				groupId = group.enabled
					? ( group.fields && group.fields.includes( 'dateStartDay' )
						? /[0-9]{4}-[0-9]{2}-[0-9]{2}/.exec( dayjs( timeSlot.dateStart ).format( dateFormat ) )
						: [...group.fields].map( k => get( timeSlot, k ) ).join( '#####' )
					)
					: ['all'];

				if ( groupId && groupId.length ) {
					groupId = groupId[0];
				}
			} else {
				groupId = [...optionsGroupingKeysRemaining].map( k => timeSlot[k] ).join( '#####' );
			}
			return groupId;
		} );
		set( timeSlotsGrouped, groupIds, [
			...get( timeSlotsGrouped, groupIds, [] ),
			timeSlot,
		] );
	} );
	sortTimeSlotsGrouped( timeSlotsGrouped );

  	return <div className='container-fluid mb-3'>

		<div className="form-check form-switch">
			<input
				title="Group record by day"
				className="form-check-input"
				type="checkbox"
				role="switch"
				checked={ shouldGroupDays }
				onChange={ () => {
					setShouldGroupDays( ! shouldGroupDays );
				} }
			/>
		</div>

		<div className="timeSlots-table">
		{ Object.keys( timeSlotsGrouped ).map( groupDateId => <Fragment key={ groupDateId }>
				<div className="row">

				<div className="col position-relative">
						<span className="bg-body-bg bg-body z-1 pe-4">
						{ 'all' === groupDateId ? '' : dayjs( groupDateId ).format( 'dddd DD. MMMM YYYY' ) }
					</span>
						<div
						className="border-bottom position-absolute" style={ {
								width: '95%',
								right: '1rem',
							} }
					></div>
					</div>

				{ <GroupDuration
						timeSlotsSlice={ Object.keys( timeSlotsGrouped[groupDateId] ).reduce(
							( timeSlotsSlice, groupId ) => [
								...timeSlotsSlice, ...timeSlotsGrouped[groupDateId][groupId],
							]
							, [] ) }
					/> }

				<div className={ 'col-4' }></div>

			</div>
				{ Object.keys( timeSlotsGrouped[groupDateId] ).map( groupId => <DateGroup
				key={ groupId }
				timeSlotsSlice={ timeSlotsGrouped[groupDateId][groupId] }
			/> ) }
			</Fragment> ) }
	</div>
	</div> ;
};

export default TimeSlotsTable;