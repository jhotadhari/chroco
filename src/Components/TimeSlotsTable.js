import classnames from "classnames";
import dayjs from "dayjs";
import { useState, useContext, Fragment } from "react";
import Context from '../Context';
import { TimeSlot } from "./TimeSlot";
import { sortTimeSlotsCompare } from "../utils";
const { api } = window;

const GroupInput = ( {
	field,
	timeSlot,
	updateTimeSlots,
	editTimeSlot,
	setEditTimeSlot,
  } ) => {
	const isDirty = undefined !== editTimeSlot[field] && editTimeSlot[field] !== timeSlot[field];

	return <input
		onKeyDown={ e => e.key === 'Enter' && isDirty && updateTimeSlots( {
			// includeFields: [field],	// ??? TODO Bug: other dirty fields loose their changes.
		 } ) }
		className={ classnames( {
			'form-control': true,
			'dirty': isDirty,
		} ) }
		type="text"
		onChange={ ( e ) => {
		  	setEditTimeSlot( { ...editTimeSlot, [field]: e.target.value } );
		} }
		value={ undefined !== editTimeSlot[field] ? editTimeSlot[field] : timeSlot[field] }
	/>;
};


const GroupHeader = ( {
	timeSlotsSlice,
	expanded,
	setExpanded,
} ) => {

	const {
		setTimeSlots,
		timeSlots,
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

	return <tr>
		<td
			className="bg-transparent"
			colSpan='1'
		>
			 <button
				className="btn border-0"
				onClick={ () => setExpanded( ! expanded ) }
			>
				{ expanded ? '-' : '+' }
			</button>
		</td>

		{ <>
			{ [
				'title',
				'project',
				'client',
			].map( key => {
				return <td
				key={ key }
				className={ "bg-transparent timeSlot--" + key }
				colSpan={ 'title' === key ? 2 : 1 }
			><GroupInput
				field={ key }
				timeSlot={ timeSlotsSlice[0] }
				updateTimeSlots={ updateTimeSlots }
				editTimeSlot={ editTimeSlot }
				setEditTimeSlot={ setEditTimeSlot }
			/></td>;
			} ) }

			<td className="bg-transparent"></td>
			<td className="bg-transparent"></td>
			<td className="bg-transparent text-end">dur???</td>

			<td className={ "bg-transparent timeSlot--actions d-flex" }>
				<button
					className="btn me-2 save"
					onClick={ updateTimeSlots }
					disabled={ ! Object.keys( editTimeSlot ).length }
				>
					save
				</button>
			</td>

		</> }
	</tr>;
};

const DateGroup = ( {
	timeSlotsSlice,
} ) => {
	const {
		timeSlotSchema,
	} = useContext( Context );

	const [expanded, setExpanded] = useState( true );

	return <>
		{ timeSlotsSlice.length > 1 && <GroupHeader
			expanded={ expanded }
			setExpanded={ setExpanded }
			timeSlotsSlice={ timeSlotsSlice }
		/> }
		{ expanded && [...timeSlotsSlice].map( ( timeSlot, index ) => (
			<TimeSlot
				key={ timeSlot._id }
				timeSlot={ timeSlot }
			/>
		) ) }

		<tr><td
			className='bg-transparent spacer'
			colSpan={ Object.keys( timeSlotSchema ).length + 4 }
		></td></tr>
	</>;
};

export const TimeSlotsTable = () => {

	const {
		timeSlotSchema,
		timeSlots,
		themeSource,
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

  	return <div
		className='container-fluid py-4'
	>
		<table
			className={ classnames( {
				"py-4": true,
				"table": true,
				"table-sm": true,
				"table-dark": 'dark' === themeSource,
			} ) }
		>
			<thead>
				<tr>
					<th className='bg-transparent' scope="col"> </th>
					{ !! timeSlotSchema ? Object.keys( timeSlotSchema ).map( key => {
						if ( '_id' === key ) {
							return null;
						}
						return <th
							key={ key }
							className='bg-transparent'
							scope="col"
							colSpan={ 'title' === key ? 2 : 1 }
						>{ timeSlotSchema[key].title }</th>
					} ) : '' }
					<th className='bg-transparent' scope="col">Duration</th>
					<th className='bg-transparent' scope="col">Actions</th>
				</tr>
			</thead>

			<tbody>
				{ Object.keys( timeSlotsGrouped ).map( groupDateId => <Fragment key={ groupDateId } >
					<tr>
						<td
							className="bg-transparent"
							colSpan={ Object.keys( timeSlotSchema ).length + 2 }
						>
							{ dayjs( groupDateId ).format( 'dddd DD. MMMM YYYY' ) }
						</td>
					</tr>
					{ Object.keys( timeSlotsGrouped[groupDateId] ).map( groupId => <DateGroup
						key={ groupId }
						timeSlotsSlice={ timeSlotsGrouped[groupDateId][groupId] }
					/> ) }
				</Fragment> ) }
			</tbody>
		</table>
	</div> ;
};
