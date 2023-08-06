import classnames from 'classnames';
import { isObject } from 'lodash';
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
import ToggleBool from './ToggleBool.jsx';

const TimeSlot = ( { timeSlot } ) => {

	const [
		editTimeSlot, setEditTimeSlot,
	] = useState( {} );

	const {
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

	return <div
		className={ classnames( [
			'row',
			'timeslot',
			! timeSlot.dateStop > 0 ? 'highlight' : '',
		] ) }
	>

		<div className="col-1"></div>

		{ getSetting( 'fields' ).filter( field => '_id' !== field.key )
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
						><Input
								field={ field.key }
								timeSlot={ timeSlot }
								editTimeSlot={ _editTimeSlot }
								setEditTimeSlot={ _setEditTimeSlot }
							/></div>;
					case 'date':
						return <div
							className={ 'col-4 timeSlot--' + field.key }
							key={ field.key }
						><DateInput
								field={ field.key }
								timeSlot={ timeSlot }
								editTimeSlot={ _editTimeSlot }
								setEditTimeSlot={ _setEditTimeSlot }
							/></div>;
					case 'bool':
						return <div
							className={ 'col-1 timeSlot--' + field.key }
							key={ field.key }
						><ToggleBool
								field={ field.key }
								timeSlot={ timeSlot }
								editTimeSlot={ _editTimeSlot }
								setEditTimeSlot={ _setEditTimeSlot }
							/></div>;
					default:
						return null;
				}
			} ) }

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
				<Icon type='save' />
			</button>

			<button
				type='button'
				className={ 'btn me-2 ' + ( timeSlot.dateStop ? 'start' : 'stop' ) }
				onClick={ () => timeSlot.dateStop ? startTimeSlot( { timeSlot } ) : stopTimeSlot( { timeSlot } ) }
				title={ timeSlot.dateStop ? 'Start' : 'Stop' }
			>
				{ timeSlot.dateStop && <Icon type='play' /> }
				{ ! timeSlot.dateStop && <Icon type='stop' /> }
			</button>

			<button
				type='button'
				className="btn delete"
				onClick={ () => deleteTimeSlot( { deleteId: timeSlot._id } ) }
				title="Delete"
			>
				<Icon type='trash' />
			</button>

		</div>

	</div>;
};

export default TimeSlot;