import React, {
	useState,
	useContext,
	useRef,
} from 'react';
import classnames from 'classnames';
import {
	get,
	isObject,
} from 'lodash';
import Context from '../Context';
import useTimeSlotCrud from '../hooks/useTimeSlotCrud';
import Icon from './Icon.jsx';
import DateInput from './DateInput.jsx';
import Duration from './Duration.jsx';
import Input from './Input.jsx';
import ToggleBool from './ToggleBool.jsx';

const CreateTimeSlot = () => {

	const [
		editTimeSlot, setEditTimeSlot,
	] = useState( {} );
	const [
		random, setRandom,
	] = useState( 0 );
	const ref = useRef( null );

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

	const timeSlot = timeSlotCurrent ? timeSlotCurrent : false;
	const isCurrent = !! timeSlotCurrent && timeSlotCurrent._id === timeSlot._id;
	const _editTimeSlot = isCurrent ? timeSlotCurrentEdit : editTimeSlot;
	const _setEditTimeSlot = isCurrent ? setTimeSlotCurrentEdit : setEditTimeSlot;

  	return <div
		ref={ ref }
		// tabIndex="0"
		onFocus={ () => setRandom( Math.random() ) }
		onBlur={ () => setRandom( Math.random() ) }
		className="container-fluid mb-5 mt-3 create-timeSlot"
		onKeyDown={ e => {
			switch( e.key ) {
				case 'Enter':
					if ( e.ctrlKey && ! get( timeSlot, '_id' ) ) {
						startTimeSlot( { timeSlot: editTimeSlot } );
						_setEditTimeSlot( {} );
					}
					break;
			}
		} }
  	>

		<div className="row mb-2">
		<div className="col">
				{ timeSlotCurrent ? 'Current' : 'Add new' }

				{ ! get( timeSlot, '_id' )
					&& ref
					&& ref.current
					&& ref.current.contains( document.activeElement )
					&& <span className="ms-5">Press <span className="font-style-italic"> "ctrl + Enter" </span> to start time tracking</span>
				}
				{ timeSlotCurrent
					&& timeSlotCurrent._id
					&& <span className="ms-5">Press <span className="font-style-italic"> "ctrl + Escape" </span> to stop time tracking</span>
				}
			</div>
	</div>

		<div
		className={ classnames( [
				'row',
				timeSlotCurrent ? 'highlight' : '',
			] ) }
	>

		<div className="col-1"></div>

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
							><Input
									field={ field.key }
									useDefault={ true }
									timeSlot={ timeSlot }
									editTimeSlot={ _editTimeSlot }
									setEditTimeSlot={ _setEditTimeSlot }
								/></div>;
						case 'bool':
							return <div
								key={ field.key }
								className={ 'col-1 timeSlot--' + field.key }
							><ToggleBool
									field={ field.key }
									useDefault={ true }
									timeSlot={ timeSlot }
									editTimeSlot={ _editTimeSlot }
									setEditTimeSlot={ _setEditTimeSlot }
								/></div>;
						default:
							return null;
					}
				},
				) }

		<div className="col-4">
				{ timeSlot && <DateInput
				field={ 'dateStart' }
				timeSlot={ timeSlot }
				editTimeSlot={ _editTimeSlot }
				setEditTimeSlot={ _setEditTimeSlot }
			/> }
			</div>

		<div className="col-4"></div>

		{ timeSlot && <Duration
				timeSlot={ timeSlot }
				editTimeSlot={ _editTimeSlot }
			/> }

		{ ! timeSlot && <div className="col-3 timeSlot--duration"></div> }

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
				disabled={ ! timeSlotCurrent || ! isObject( _editTimeSlot ) || ! Object.keys( _editTimeSlot ).length }
				title="Save"
			>
				<Icon type='save' />
			</button>

				<button
				type='button'
				className={ 'btn me-2 ' + ( timeSlot.dateStop ? 'start' : 'stop' ) }
				onClick={ () => {
						if ( ! timeSlotCurrent ) {
							startTimeSlot( { timeSlot: _editTimeSlot } );
							setEditTimeSlot( {} );
						} else {
							stopTimeSlot( { timeSlot: timeSlotCurrent } );
							_setEditTimeSlot( {} );
						}
					} }
				title={ timeSlot.dateStop ? 'Start' : 'Stop' }
			>
				{ ! timeSlotCurrent && <Icon type='play' /> }
				{ timeSlotCurrent && <Icon type='stop' /> }
			</button>

				{ timeSlot._id && <button
				type='button'
				className="btn delete"
				onClick={ () => deleteTimeSlot( { deleteId: timeSlot._id } ) }
				title="Delete"
			>
				<Icon type='trash' />
				</button> }

			</div>
	</div>
	</div>;
};

export default CreateTimeSlot;