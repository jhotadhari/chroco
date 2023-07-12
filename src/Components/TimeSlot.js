import classnames from "classnames";
import dayjs from "dayjs";
import {
  useState,
  useContext,
  // useEffect,
  // useRef
} from "react";
import Context from '../Context';
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

const formatSeconds = seconds => {
  let isNeg = false;
  if ( seconds < 0 ) {
    isNeg = true;
    seconds = seconds * ( -1 );
  }
  let d = Number( seconds );
  let h = Math.floor( d / 3600 );
  let m = Math.floor( d % 3600 / 60 );
  // let s = Math.floor( d % 3600 % 60 );
  return ( isNeg ? '- ' : '' ) + ( h ? h + ' h ' : '' ) + m + ' m';
};

const Duration = ( {
  start,
  stop,
} ) => {
  stop = stop ? stop : dayjs();
  const seconds = start && stop
    ? dayjs( stop ).diff( dayjs( start ), 'second' )
    : false;
  return <td
    colSpan="1"
    className={ classnames( {
      "timeSlot--duration": true,
      "text-end": true,
      'align-middle': true,
      'bg-transparent': true,
    } ) }
  >
    <span
      className={ classnames( {
        invalid: seconds < 0,
        'p-2': true,
      } ) }
    >
      { false !== seconds
        ? formatSeconds( seconds )
        : '- m' }
    </span>
  </td>;
};

const DateInput = ( {
  field,
  timeSlot,
  updateTimeSlot,
  editTimeSlot,
  setEditTimeSlot,
} ) => {
  const [tempVal, setTempVal] = useState( false );
  const val = timeSlot[field]
    ? dayjs( undefined !== editTimeSlot[field] ? editTimeSlot[field] : timeSlot[field] ).format( 'YYYY-MM-DD HH:mm:ss' )
    : '';
  const isDirty = tempVal || ( undefined !== editTimeSlot[field] && editTimeSlot[field] !== timeSlot[field] );

  return <input
      onKeyDown={ e => e.key === 'Enter' && isDirty && updateTimeSlot( { includeFields: [field] } ) }
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
    />;
};

const Input = ( {
  field,
  timeSlot,
  updateTimeSlot,
  editTimeSlot,
  setEditTimeSlot,
} ) => {
  const isDirty = undefined !== editTimeSlot[field] && editTimeSlot[field] !== timeSlot[field];

  return <input
      onKeyDown={ e => e.key === 'Enter' && isDirty && updateTimeSlot( {
			  // includeFields: [field],	// ??? TODO Bug with group updateTimeSlots: other dirty fields loose their changes. Actually here it works fine, but disabled for now.
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

  return <tr>

    <td className="bg-transparent"></td>

    { !! timeSlotSchema ? Object.keys( timeSlotSchema ).map( key => {
      if ( '_id' === key ) {
        return null;
      }
      switch( timeSlotSchema[key].type ) {
        case 'text':
            return <td
              key={ key }
              className={ "bg-transparent timeSlot--" + key }
              colSpan={ 'title' === key ? 2 : 1 }
            ><Input
              field={ key }
              timeSlot={ timeSlot }
              updateTimeSlot={ updateTimeSlot }
              editTimeSlot={ editTimeSlot }
              setEditTimeSlot={ setEditTimeSlot }
            /></td>;
        case 'date':
          return <td
            className={ "bg-transparent timeSlot--" + key }
            key={ key }
            colSpan="1"
          ><DateInput
            field={ key }
            timeSlot={ timeSlot }
            updateTimeSlot={ updateTimeSlot }
            editTimeSlot={ editTimeSlot }
            setEditTimeSlot={ setEditTimeSlot }
          /></td>;
        default:
            return null;
      }
    } ) : '' }

      <Duration
        start={ editTimeSlot.dateStart ? editTimeSlot.dateStart : timeSlot.dateStart }
        stop={ editTimeSlot.dateStop ? editTimeSlot.dateStop : timeSlot.dateStop }
      />

      <td
        colSpan="1"
        className={ "bg-transparent timeSlot--actions d-flex" }
      >
        <button
          className="btn me-2 save"
          onClick={ updateTimeSlot }
          disabled={ ! Object.keys( editTimeSlot ).length }
        >
          save
        </button>

        <button
          type='button'
          className={ 'btn me-2 ' + ( timeSlot.dateStop ? 'start' : 'stop' ) }
          onClick={ timeSlot.dateStop ? startTimeSlot : stopTimeSlot }
        >
          { timeSlot.dateStop ? 'Start' : 'Stop' }
        </button>

        <button
          type='button'
          className="btn delete"
          onClick={ deleteTimeSlot }
        >
          delete
        </button>

      </td>

  </tr>;
};
