import { useState, useContext } from "react";
import classnames from "classnames";
import Icon from "./Icon";
import Context from '../Context';

import {
	Input,
	Duration,
	DateInput,
	deleteTimeSlot,
	stopTimeSlot,
	updateTimeSlot,
	startTimeSlot,
} from "./TimeSlot";

export const CreateTimeSlot = () => {

	const [editTimeSlot, setEditTimeSlot] = useState( {} );

	const {
		timeSlotSchema,
		timeSlots,
		setTimeSlots,
		getSetting,
		timeSlotCurrent,
	} = useContext( Context );

	const timeSlot = timeSlotCurrent ? timeSlotCurrent : false;

  	return <div className="container-fluid mb-3 create-timeSlot">

		<div className="row">
			<div className="col">
				{ timeSlotCurrent ? 'Current' : 'Add new' }
			</div>
		</div>

		<div className="row">

			<div className="col-1"></div>

			{ !! timeSlotSchema ? Object.keys( timeSlotSchema ).filter( key => {
				if ( 'date' === timeSlotSchema[key].type ) {
					return false;
				}
				return ! [
					...getSetting( 'hideFields' ),
					'_id',
				].includes( key )
			} ).map( key => {
				return <div
					key={ key }
					className={ classnames( [
					'timeSlot--' + key,
					'title' === key ? 'col-9' : 'col'
					] ) }
				><Input
					field={ key }
					useDefault={ true }
					timeSlot={ timeSlot }
					timeSlots={ timeSlots }
					setTimeSlots={ setTimeSlots }
					updateTimeSlot={ () => updateTimeSlot( {
					  timeSlot,
					  timeSlots,
					  setTimeSlots,
					  editTimeSlot,
					  setEditTimeSlot,
					} ) }
					editTimeSlot={ editTimeSlot }
					setEditTimeSlot={ setEditTimeSlot }
				/></div>
			} ) : '' }

			<div className="col">
				{ timeSlot && <DateInput
					field={ 'dateStart' }
					timeSlot={ timeSlot }
					timeSlots={ timeSlots }
					setTimeSlots={ setTimeSlots }
					updateTimeSlot={ () => updateTimeSlot( {
						timeSlot,
						timeSlots,
						setTimeSlots,
						editTimeSlot,
						setEditTimeSlot,
					} ) }
					editTimeSlot={ editTimeSlot }
					setEditTimeSlot={ setEditTimeSlot }
				/> }
			</div>

			<div className="col"></div>

			{ timeSlot && <Duration
				start={ editTimeSlot.dateStart ? editTimeSlot.dateStart : timeSlot.dateStart }
				stop={ editTimeSlot.dateStop ? editTimeSlot.dateStop : timeSlot.dateStop }
				isDirty={ ( editTimeSlot.dateStart && editTimeSlot.dateStart !== timeSlot.dateStart )
				|| ( editTimeSlot.dateStop && editTimeSlot.dateStop !== timeSlot.dateStop )
				}
			/> }

			{ ! timeSlot && <div className="col-3 timeSlot--duration"></div> }

			<div
				className={ "col-4 timeSlot--actions d-flex" }
			>
				<button
					className="btn me-2 save"
					onClick={ () => updateTimeSlot( {
						timeSlot,
						timeSlots,
						setTimeSlots,
						editTimeSlot,
						setEditTimeSlot,
					} ) }
					disabled={ ! timeSlotCurrent || ! Object.keys( editTimeSlot ).length }
					title="Save"
				>
					<Icon type='save'/>
				</button>

				<button
					type='button'
					className={ 'btn me-2 ' + ( timeSlot.dateStop ? 'start' : 'stop' ) }
					onClick={ () => ! timeSlotCurrent ? startTimeSlot( {
						timeSlot: editTimeSlot,
						timeSlots,
						setTimeSlots,
					} ) : ( stopTimeSlot( {
						timeSlot: timeSlotCurrent,
						timeSlots,
						setTimeSlots,
					} ) && setEditTimeSlot( {} ) ) }
					title={ timeSlot.dateStop ? 'Start' : 'Stop' }
				>
					{ ! timeSlotCurrent && <Icon type='play'/> }
					{ timeSlotCurrent && <Icon type='stop'/> }
				</button>

				{ timeSlot._id && <button
					type='button'
					className="btn delete"
					onClick={ () => deleteTimeSlot( {
						deleteId: timeSlot._id,
						timeSlots,
						setTimeSlots,
					} ) }
					title="Delete"
				>
					<Icon type='trash'/>
				</button> }

			</div>
    	</div>
	</div>;
};
