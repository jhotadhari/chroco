import classnames from "classnames";
import dayjs from "dayjs";
import {
  get,
  isObject,
} from "lodash";
import {
	useState,
	useContext,
	// useEffect,
	Fragment,
	// useRef,
} from "react";
import Autosuggest from 'react-autosuggest';
import Context from '../Context';
import {
	TimeSlot,
	stopTimeSlot,
	startTimeSlot,
} from "./TimeSlot";
import useTick from "../hooks/useTick";
import { getFilteredSuggestions } from "./Input";
import Icon from "./Icon";
import {
	sortTimeSlotsCompare,
	formatSeconds,
} from "../utils";
const { api } = window;

const GroupInput = ( {
	field,
	useDefault,
	timeSlot,
	updateTimeSlots,
	editTimeSlot,
	setEditTimeSlot,
  } ) => {

	const {
		timeSlotSchema,
		fieldSuggestions,
		addFieldSuggestion,
	} = useContext( Context );

	const title = get( timeSlotSchema, [field,'title'], '' );
	const defaultVal = useDefault ? get( timeSlotSchema, [field, 'default'], '' ) : '';
	const value = get( editTimeSlot, field, get( timeSlot, field, defaultVal ) );
	const isDirty = get( editTimeSlot, field, get( timeSlot, field ) ) !== get( timeSlot, field );

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
					updateTimeSlots( {
						// includeFields: [field],	// ??? TODO Bug: other dirty fields loose their changes.
					} );
					addFieldSuggestion( editTimeSlot[field] );
					break;
				case 'Escape':
					const newEditTimeSlot = {...editTimeSlot}
					delete newEditTimeSlot[field];
					setEditTimeSlot(newEditTimeSlot );
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

const GroupDuration = ( {
	timeSlotsSlice,
  } ) => {

	const {
		timeSlotCurrent,
		timeSlotCurrentEdit,
	} = useContext( Context );

	useTick( timeSlotCurrent
		? !! timeSlotsSlice.find( ts => ts._id === timeSlotCurrent._id )
		: undefined
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
		"timeSlot--duration": true,
		"text-end": true,
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
		timeSlots,
		getSetting,
	} = useContext( Context );

	const [editTimeSlot, setEditTimeSlot] = useState( {} );

	const updateTimeSlots = ( { includeFields } ) => {
		let newTimeSlots = [...timeSlots];
		return [...timeSlotsSlice].reduce( ( accumulatorPromise, timeSlot, index ) => {
			return accumulatorPromise.then( () => {
				return new Promise( ( resolve, reject ) => {
					let newEditTimeSlot = {};
					let newTimeSlot = {...timeSlot};
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

	return <div className={ classnames( [
		'row',
		! expanded && timeSlotsSliceCurrents.length > 0 ? 'highlight' : '',
	] ) }>
		<div className="col-1" >
			 <button
				className="btn border-0 d-flex align-items-center"
				onClick={ () => setExpanded( ! expanded ) }
				title={ expanded ? 'Collapse' : 'Expand' }
			>
				<span className="group-count">
					{ timeSlotsSlice.length }
				</span>
				{ expanded && <Icon type='caret-right'/> }
				{ ! expanded && <Icon type='caret-down'/> }
			</button>
		</div>

		{ <>
			{ [
				'title',
				'project',
				'client',
				'user',
			].filter( key => ! [
				...getSetting( 'hideFields' ),
				'_id',
			].includes( key ) ).map( key => {
				return <div
					key={ key }
					className={ classnames( [
						'timeSlot--' + key,
						'title' === key ? 'col-9' : 'col',
						'position-relative',
					] ) }
				>
					<GroupInput
						field={ key }
						timeSlot={ timeSlotsSlice[0] }
						updateTimeSlots={ updateTimeSlots }
						editTimeSlot={ editTimeSlot }
						setEditTimeSlot={ setEditTimeSlot }
					/>
				</div>;
			} ) }

			<div className="col"></div>
			<div className="col"></div>

			<GroupDuration
				timeSlotsSlice={ timeSlotsSlice }
			/>

			<div className={ "col-4 timeSlot--actions d-flex" }>
				<button
					className="btn me-2 save"
					onClick={ updateTimeSlots }
					disabled={ ! isObject( editTimeSlot ) || ! Object.keys( editTimeSlot ).length }
					title="Save"
				>
					<Icon type='save'/>
				</button>

				<button
					type='button'
					className={ 'btn me-2 ' + ( timeSlotsSliceCurrents.length ? 'stop' : 'start' ) }
					onClick={ () => {
						if ( timeSlotsSliceCurrents.length ) {
							// stop all, should be max one.
							[...timeSlotsSliceCurrents].map( timeSlot => stopTimeSlot( {
								timeSlot,
								timeSlots,
								setTimeSlots,
							} ) );
						} else {
							// start new one
							startTimeSlot( {
								timeSlot: timeSlotsSlice[0],
								timeSlots,
								setTimeSlots,
							} )
						}
					} }
					title={ timeSlotsSliceCurrents.length ? 'Stop' : 'Start' }
				>
					{ 0 == timeSlotsSliceCurrents.length && <Icon type='play'/> }
					{ timeSlotsSliceCurrents.length > 0 && <Icon type='stop'/> }
				</button>
			</div>

		</> }
	</div>;
};

const DateGroup = ( {
	timeSlotsSlice,
} ) => {
	const timeSlotsSliceCurrents = timeSlotsSlice.filter( ts => ! ts.dateStop );
	const [expanded, setExpanded] = useState( !! timeSlotsSliceCurrents.length );

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

export const TimeSlotsTable = () => {

	const {
		timeSlots,
	} = useContext( Context );

	const timeSlotsGrouped = {};
	[...timeSlots].map( ( timeSlot ) => {
		let groupDateId = /[0-9]{4}-[0-9]{2}-[0-9]{2}/.exec( dayjs( timeSlot.dateStart ).format('YYYY-MM-DD HH:mm:ss') );
		if ( ! groupDateId || ! groupDateId.length ) {
			return;
		}
		groupDateId = groupDateId[0];
		if ( ! timeSlotsGrouped[groupDateId] ) {
			timeSlotsGrouped[groupDateId] = {};
		}
		const groupId = [
			'title',
			'project',
			'client',
			'user',
		].map( key => timeSlot[key] ).join( '#####' );
		if ( timeSlotsGrouped[groupDateId][groupId] ) {
			timeSlotsGrouped[groupDateId][groupId] = [
				...timeSlotsGrouped[groupDateId][groupId],
				timeSlot,
			];
		} else {
			timeSlotsGrouped[groupDateId][groupId] = [
				timeSlot,
			];
		}
	} );

	Object.keys( timeSlotsGrouped ).map( groupDateId => {
		Object.keys( timeSlotsGrouped[groupDateId] ).map( groupId => {
			timeSlotsGrouped[groupDateId][groupId].sort( sortTimeSlotsCompare );
		} );
	} );

  	return <div className='container-fluid mb-3' >
		<div className="timeSlots-table" >
			{ Object.keys( timeSlotsGrouped ).map( groupDateId => <Fragment key={ groupDateId } >
					<div className="row">

						<div className="col position-relative">
							<span className="bg-body-bg bg-body z-1 pe-4">
								{ dayjs( groupDateId ).format( 'dddd DD. MMMM YYYY' ) }
							</span>
							<div className="border-bottom position-absolute" style={ {
								width: '95%',
								right: '1rem',
							} }
							></div>
						</div>

						{ <GroupDuration
							timeSlotsSlice={ Object.keys( timeSlotsGrouped[groupDateId] ).reduce(
								( timeSlotsSlice, groupId ) => [...timeSlotsSlice,...timeSlotsGrouped[groupDateId][groupId]]
							, [] ) }
						/> }

						<div className={ "col-4" }></div>

					</div>
					{ Object.keys( timeSlotsGrouped[groupDateId] ).map( groupId => <DateGroup
						key={ groupId }
						timeSlotsSlice={ timeSlotsGrouped[groupDateId][groupId] }
					/> ) }
				</Fragment> ) }
		</div>
	</div> ;
};
