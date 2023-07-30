import classnames from 'classnames';
import {
	isObject,
} from 'lodash';
import React, {
	useState,
	useContext,
} from 'react';
import Context from '../Context';
import useTimeSlotCrud from '../hooks/useTimeSlotCrud';
import Icon from './Icon.jsx';
import DateInput from './DateInput.jsx';
import Duration from './Duration.jsx';
import Input from './Input.jsx';

const TimeSlot = ( {timeSlot} ) => {

	const [
		editTimeSlot, setEditTimeSlot,
	] = useState( {
	} );

	const {
		timeSlotSchema,
		getSetting,
		timeSlotCurrent,
		timeSlotCurrentEdit,
		setTimeSlotCurrentEdit,
	} = useContext( Context );

	const {
		startTimeSlot,
		updateTimeSlot,
		stopTimeSlot,
		deleteTimeSlot,
	} = useTimeSlotCrud();

	const isCurrent = !! timeSlotCurrent && timeSlotCurrent._id === timeSlot._id;
	const _editTimeSlot = isCurrent ? timeSlotCurrentEdit : editTimeSlot;
	const _setEditTimeSlot = isCurrent ? setTimeSlotCurrentEdit : setEditTimeSlot;

	return <div className={ classnames( [
		'row',
		! timeSlot.dateStop > 0 ? 'highlight' : '',
	] ) }>

		<div className="col-1"></div>

		{ timeSlotSchema ? Object.keys( timeSlotSchema ).filter( key => ! [
			...getSetting( 'hideFields' ),
			'_id',
		].includes( key ) )
			.map( key => {
				switch( timeSlotSchema[key].type ) {
					case 'text':
						return <div
							key={ key }
							className={ classnames( [
								'timeSlot--' + key,
								'title' === key ? 'col-9' : 'col',
								'position-relative',
							] ) }
						><Input
								field={ key }
								timeSlot={ timeSlot }
								editTimeSlot={ _editTimeSlot }
								setEditTimeSlot={ _setEditTimeSlot }
							/></div>;
					case 'date':
						return <div
							className={ 'col-4 timeSlot--' + key }
							key={ key }
						><DateInput
								field={ key }
								timeSlot={ timeSlot }
								editTimeSlot={ _editTimeSlot }
								setEditTimeSlot={ _setEditTimeSlot }
							/></div>;
					default:
						return null;
				}
			} ) : '' }

		<Duration
			timeSlot={ timeSlot }
			editTimeSlot={ _editTimeSlot }
		/>

		<div
			className={ 'col-4 timeSlot--actions d-flex' }
		>
			<button
				className="btn me-2 save"
				onClick={ () => updateTimeSlot( {
					timeSlot,
					editTimeSlot: _editTimeSlot,
					setEditTimeSlot: _setEditTimeSlot,
				} ) }
				disabled={ ! isObject( _editTimeSlot ) || ! Object.keys( _editTimeSlot ).length }
				title="Save"
			>
				<Icon type='save'/>
			</button>

			<button
				type='button'
				className={ 'btn me-2 ' + ( timeSlot.dateStop ? 'start' : 'stop' ) }
				onClick={ () => timeSlot.dateStop ? startTimeSlot( {
					timeSlot,
				} ) : stopTimeSlot( {
					timeSlot,
				} ) }
				title={ timeSlot.dateStop ? 'Start' : 'Stop' }
			>
				{ timeSlot.dateStop && <Icon type='play'/> }
				{ ! timeSlot.dateStop && <Icon type='stop'/> }
			</button>

			<button
				type='button'
				className="btn delete"
				onClick={ () => deleteTimeSlot( {
					deleteId: timeSlot._id,
				} ) }
				title="Delete"
			>
				<Icon type='trash'/>
			</button>

		</div>

	</div>;
};

export default TimeSlot;