import classnames from "classnames";
import dayjs from "dayjs";
import {
  omit,
  isObject,
} from "lodash";
import {
  useState,
  useContext,
} from "react";
import Icon from "./Icon";

import DateInput from "./DateInput";
import Duration from "./Duration";
import Input from "./Input";

import Context from '../Context';
const { api } = window;




export const deleteTimeSlot = ( {
  deleteId,
  timeSlots,
  setTimeSlots,
} ) => {
  api.timeSlots.delete( deleteId ).then( numberDeleted => {
    if ( numberDeleted ) {
      const newTimeSlots = [...timeSlots];
      const idx = newTimeSlots.findIndex( ts => ts._id === deleteId );
      newTimeSlots.splice( idx, 1 );
      setTimeSlots( newTimeSlots );
    }
  } );
};

export const stopTimeSlot = ( {
  timeSlot,
  timeSlots,
  setTimeSlots,
} ) => {
  api.timeSlots.stop( timeSlot ).then( updatedTimeSlot => {
    if ( updatedTimeSlot ) {
      const newTimeSlots = [...timeSlots];
      const idx = newTimeSlots.findIndex( ts => ts._id === timeSlot._id );
      newTimeSlots.splice( idx, 1, updatedTimeSlot );
      setTimeSlots( newTimeSlots );
    }
  } );
};

export const updateTimeSlot = ( {
  timeSlot,
  timeSlots,
  includeFields,
  setTimeSlots,
  editTimeSlot,
  setEditTimeSlot,
} ) => {
  if ( ! timeSlot || ! timeSlot._id ) {
    return;
  }
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
      const newTimeSlots = [...timeSlots];
      const idx = newTimeSlots.findIndex( ts => ts._id === timeSlot._id );
      newTimeSlots.splice( idx, 1, newTimeSlot );
      setTimeSlots( newTimeSlots );
      setEditTimeSlot( newEditTimeSlot );
    }
  } );
};

export const startTimeSlot = ( {
  timeSlot,
  timeSlots,
  setTimeSlots,
} ) => {
  const newTimeSlot = omit( {
    ...timeSlot,
    dateStart: dayjs().valueOf(),
    dateStop: undefined,
  }, [
    '_id',
    'createdAt',
    'updatedAt',
  ] );

  api.timeSlots.add( newTimeSlot ).then( ( { addedTimeSlot, stoppedTimeSlot } ) => {
    const newTimeSlots = [
      addedTimeSlot,
      ...timeSlots,
    ];
    if ( stoppedTimeSlot ) {
    const idxStopped = newTimeSlots.findIndex( ts => ts._id === stoppedTimeSlot._id );
      if ( idxStopped ) {
        newTimeSlots.splice( idxStopped, 1, stoppedTimeSlot );
      }
    }
    setTimeSlots( newTimeSlots );
  } );
};

export const TimeSlot = ( {
  timeSlot,
} ) => {

  const [editTimeSlot, setEditTimeSlot] = useState( {} );

	const {
		timeSlotSchema,
		timeSlots,
		setTimeSlots,
		getSetting,
    timeSlotCurrent,
    timeSlotCurrentEdit,
    setTimeSlotCurrentEdit,
	} = useContext( Context );

  const isCurrent = !! timeSlotCurrent && timeSlotCurrent._id === timeSlot._id;
  const _editTimeSlot = isCurrent ? timeSlotCurrentEdit : editTimeSlot;
  const _setEditTimeSlot = isCurrent ? setTimeSlotCurrentEdit : setEditTimeSlot;

  return <div className={ classnames( [
		'row',
		! timeSlot.dateStop > 0 ? 'highlight' : '',
	] ) }>

    <div className="col-1"></div>

    { !! timeSlotSchema ? Object.keys( timeSlotSchema ).filter( key => ! [
      ...getSetting( 'hideFields' ),
      '_id',
    ].includes( key ) ).map( key => {
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
              updateTimeSlot={ () => updateTimeSlot( {
                timeSlot,
                timeSlots,
                setTimeSlots,
                editTimeSlot: _editTimeSlot,
                setEditTimeSlot: _setEditTimeSlot,
              } ) }
              editTimeSlot={ _editTimeSlot }
              setEditTimeSlot={ _setEditTimeSlot }
            /></div>;
        case 'date':
          return <div
            className={ "col timeSlot--" + key }
            key={ key }
          ><DateInput
            field={ key }
            timeSlot={ timeSlot }
            updateTimeSlot={ () => updateTimeSlot( {
              timeSlot,
              timeSlots,
              setTimeSlots,
              editTimeSlot: _editTimeSlot,
              setEditTimeSlot: _setEditTimeSlot,
            } ) }
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
        className={ "col-4 timeSlot--actions d-flex" }
      >
        <button
          className="btn me-2 save"
          onClick={ () => updateTimeSlot( {
            timeSlot,
            timeSlots,
            setTimeSlots,
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
            timeSlots,
            setTimeSlots,
          } ) : stopTimeSlot( {
            timeSlot,
            timeSlots,
            setTimeSlots,
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
            timeSlots,
            setTimeSlots,
          } ) }
					title="Delete"
        >
          <Icon type='trash'/>
        </button>

      </div>

  </div>;
};
