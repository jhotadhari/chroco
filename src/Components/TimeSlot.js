import classnames from "classnames";
import dayjs from "dayjs";
import {
  useState,
  useContext,
  // useEffect,
  // useRef
} from "react";
import Icon from "./Icon";
import Context from '../Context';
import { formatSeconds } from '../utils';
const { api } = window;

const isValidDateInput = dateInputString => {
  const regex = /([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-2][0-9]):([0-5][0-9]):([0-5][0-9])/;
  if ( ! regex.test( dateInputString ) ) {
    return false;
  }
  const dateParsed = regex.exec( dateInputString );
  if (
    7 !== dateParsed.length
    || parseInt( dateParsed[2], 10 ) > 12   // month
    || parseInt( dateParsed[3], 10 ) > 31   // day
    || parseInt( dateParsed[4], 10 ) > 23   // hour
    || parseInt( dateParsed[5], 10 ) > 59   // minute
    || parseInt( dateParsed[6], 10 ) > 59   // second
  ) {
    return false;
  }
  return true;
};

const Duration = ( {
  start,
  stop,
  isDirty,
} ) => {
  stop = stop ? stop : dayjs();
  const seconds = start && stop
    ? dayjs( stop ).diff( dayjs( start ), 'second' )
    : false;
  return <div
    className={ classnames( {
      "timeSlot--duration": true,
      "text-end": true,
      'align-middle': true,
      'bg-transparent': true,
      'col-3': true,
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

const DateInput = ( {
  field,
  timeSlot,
  updateTimeSlot,
  editTimeSlot,
  setEditTimeSlot,
} ) => {
  const { timeSlotSchema } = useContext( Context );
  const [tempVal, setTempVal] = useState( false );
  const format = 'YYYY-MM-DD HH:mm:ss';
  const val = timeSlot[field]
    ? dayjs( undefined !== editTimeSlot[field] ? editTimeSlot[field] : timeSlot[field] ).format( format )
    : '';
  const isDirty = tempVal || ( undefined !== editTimeSlot[field] && editTimeSlot[field] !== timeSlot[field] );
  const title = timeSlotSchema[field] && timeSlotSchema[field].title ? timeSlotSchema[field].title : '';

  return <input
      onKeyDown={ e => {
        if ( isDirty ) {
          switch( e.key ) {
            case 'Enter':
              updateTimeSlot( {
                // includeFields: [field],	// ??? TODO Bug with group updateTimeSlots: other dirty fields loose their changes. Actually here it works fine, but disabled for now.
              } );
              break;
            case 'Escape':
              const newEditTimeSlot = {...editTimeSlot}
              delete newEditTimeSlot[field];
              setEditTimeSlot(newEditTimeSlot );
              break;
          }
        }
      } }
      className={ classnames( {
        'form-control': true,
        'dirty': isDirty,
        'invalid': tempVal && ! isValidDateInput( tempVal ),
      } ) }
      type="text"
      disabled={ ! timeSlot[field] }
      onBlur={ () => {
        if ( tempVal && isValidDateInput( tempVal ) ) {
          setTempVal( false );
        }
      } }
      onChange={ ( e ) => {
        setTempVal( e.target.value );
        if ( isValidDateInput( e.target.value ) ) {
          setEditTimeSlot( {
            ...editTimeSlot,
            [field]: dayjs( e.target.value ).valueOf(),
          } );
        }
      } }
      value={ tempVal
        ? tempVal
        : val
      }
      title={ title }
      placeholder={ format }
    />;
};

const Input = ( {
  field,
  timeSlot,
  updateTimeSlot,
  editTimeSlot,
  setEditTimeSlot,
} ) => {
	const { timeSlotSchema } = useContext( Context );
  const title = timeSlotSchema[field] && timeSlotSchema[field].title ? timeSlotSchema[field].title : '';
  const isDirty = undefined !== editTimeSlot[field] && editTimeSlot[field] !== timeSlot[field];

  return <input
      onKeyDown={ e => {
        if ( isDirty ) {
          switch( e.key ) {
            case 'Enter':
              updateTimeSlot( {
                // includeFields: [field],	// ??? TODO Bug with group updateTimeSlots: other dirty fields loose their changes. Actually here it works fine, but disabled for now.
              } );
              break;
            case 'Escape':
              const newEditTimeSlot = {...editTimeSlot}
              delete newEditTimeSlot[field];
              setEditTimeSlot(newEditTimeSlot );
              break;
          }
        }
      } }
      className={ classnames( {
        'form-control': true,
        'dirty': isDirty,
      } ) }
      type="text"
      onChange={ ( e ) => {
        setEditTimeSlot( { ...editTimeSlot, [field]: e.target.value } );
      } }
      value={ undefined !== editTimeSlot[field] ? editTimeSlot[field] : timeSlot[field] }
      title={ title }
      placeholder={ title }
    />;
};

export const TimeSlot = ( {
  timeSlot,
} ) => {

  const [editTimeSlot, setEditTimeSlot] = useState( {} );

	const {
		timeSlotSchema,
		timeSlots,
		setTimeSlots,
	} = useContext( Context );

  const deleteTimeSlot = () => {
    api.timeSlots.delete( timeSlot._id ).then( numberDeleted => {
      if ( numberDeleted ) {
        const newTimeSlots = [...timeSlots];
        const idx = newTimeSlots.findIndex( ts => ts._id === timeSlot._id );
        newTimeSlots.splice( idx, 1 );
        setTimeSlots( newTimeSlots );
      }
    } );
  };

  const stopTimeSlot = () => {
    api.timeSlots.stop( timeSlot ).then( updatedTimeSlot => {
      if ( updatedTimeSlot ) {
        const newTimeSlots = [...timeSlots];
        const idx = newTimeSlots.findIndex( ts => ts._id === timeSlot._id );
        newTimeSlots.splice( idx, 1, updatedTimeSlot );
        setTimeSlots( newTimeSlots );
      }
    } );
  };

	const updateTimeSlot = ( { includeFields, ts } ) => {
    let newEditTimeSlot = {};
    let newTimeSlot = {...( ts ? ts : timeSlot )};
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

  const startTimeSlot = () => {
    const newTimeSlot = {
      ...timeSlot,
      dateStart: dayjs().valueOf(),
      dateStop: false,
    };
    [
      '_id',
      'createdAt',
      'updatedAt',
    ].map( key => {
      delete newTimeSlot[key];
      return null;
    } );
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

  return <div className="row">

    <div className="col-1"></div>

    { !! timeSlotSchema ? Object.keys( timeSlotSchema ).map( key => {
      if ( '_id' === key ) {
        return null;
      }
      switch( timeSlotSchema[key].type ) {
        case 'text':
            return <div
              key={ key }
              className={ classnames( [
                'timeSlot--' + key,
                'title' === key ? 'col-9' : 'col-4'
              ] ) }
            ><Input
              field={ key }
              timeSlot={ timeSlot }
              updateTimeSlot={ updateTimeSlot }
              editTimeSlot={ editTimeSlot }
              setEditTimeSlot={ setEditTimeSlot }
            /></div>;
        case 'date':
          return <div
            className={ "col-4 timeSlot--" + key }
            key={ key }
          ><DateInput
            field={ key }
            timeSlot={ timeSlot }
            updateTimeSlot={ updateTimeSlot }
            editTimeSlot={ editTimeSlot }
            setEditTimeSlot={ setEditTimeSlot }
          /></div>;
        default:
            return null;
      }
    } ) : '' }

      <Duration
        start={ editTimeSlot.dateStart ? editTimeSlot.dateStart : timeSlot.dateStart }
        stop={ editTimeSlot.dateStop ? editTimeSlot.dateStop : timeSlot.dateStop }
        isDirty={ ( editTimeSlot.dateStart && editTimeSlot.dateStart !== timeSlot.dateStart )
          || ( editTimeSlot.dateStop && editTimeSlot.dateStop !== timeSlot.dateStop )
        }
      />

      <div
        className={ "col-4 timeSlot--actions d-flex" }
      >
        <button
          className="btn me-2 save"
          onClick={ updateTimeSlot }
          disabled={ ! Object.keys( editTimeSlot ).length }
					title="Save"
        >
          <Icon type='save'/>
        </button>

        <button
          type='button'
          className={ 'btn me-2 ' + ( timeSlot.dateStop ? 'start' : 'stop' ) }
          onClick={ timeSlot.dateStop ? startTimeSlot : stopTimeSlot }
					title={ timeSlot.dateStop ? 'Start' : 'Stop' }
        >
          { timeSlot.dateStop && <Icon type='play'/> }
          { ! timeSlot.dateStop && <Icon type='stop'/> }
        </button>

        <button
          type='button'
          className="btn delete"
          onClick={ deleteTimeSlot }
					title="Delete"
        >
          <Icon type='trash'/>
        </button>

      </div>

  </div>;
};
