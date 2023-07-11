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
    className={ classnames( {
      "timeSlot--duration": true,
      invalid: seconds < 0,
    } ) }
  >
    { false !== seconds
      ? formatSeconds( seconds )
      : '- m' }
  </td>;
};

const DateInput = ( {
  field,
  timeSlot,
  editTimeSlot,
  setEditTimeSlot,
} ) => {
  const [tempVal, setTempVal] = useState( false );
  const val = timeSlot[field]
    ? dayjs( editTimeSlot[field] ? editTimeSlot[field] : timeSlot[field] ).format('YYYY-MM-DD HH:mm:ss')
    : '';

  return <input
      id={ "timeSlot--" + field }
      className={ classnames( {
        'form-control': true,
        'dirty': tempVal || ( editTimeSlot[field] && editTimeSlot[field] !== timeSlot[field] ),
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
  editTimeSlot,
  setEditTimeSlot,
} ) => {
  return <input
      className={ classnames( {
        'form-control': true,
        'dirty': editTimeSlot[field] && editTimeSlot[field] !== timeSlot[field],
      } ) }
      type="text"
      onChange={ ( e ) => {
        setEditTimeSlot( { ...editTimeSlot, title: e.target.value } );
      } }
      value={ editTimeSlot[field] ? editTimeSlot[field] : timeSlot[field] }
    />;
};

export const TimeSlot = ( { timeSlot, idx } ) => {

  const [editTimeSlot, setEditTimeSlot] = useState( {} );

	const {
		timeSlotSchema,
		timeSlots,
		setTimeSlots,
	} = useContext( Context );

  const deleteTimeSlot = ( e ) => {
    e.preventDefault();
    api.timeSlots.delete( timeSlot._id ).then( numberDeleted => {
      if ( numberDeleted ) {
        const newTimeSlots = [...timeSlots];
        newTimeSlots.splice( idx, 1 );
        setTimeSlots( newTimeSlots );
      }
    } );
  };

  const stopTimeSlot = ( e ) => {
    e.preventDefault();
    api.timeSlots.stop( timeSlot ).then( updatedTimeSlot => {
      if ( updatedTimeSlot ) {
        const newTimeSlots = [...timeSlots];
        newTimeSlots.splice( idx, 1, updatedTimeSlot );
        setTimeSlots( newTimeSlots );
      }
    } );
  };

  const updateTimeSlot = ( e ) => {
    e.preventDefault();
    const newTimeSlot = {
      ...timeSlot,
      ...editTimeSlot,
    };
    api.timeSlots.update( newTimeSlot ).then( numberUpdated => {
      if ( numberUpdated ) {
        const newTimeSlots = [...timeSlots];
        newTimeSlots.splice( idx, 1, newTimeSlot );
        setTimeSlots( newTimeSlots );
        setEditTimeSlot( {} );
      }
    } );
  };

  const startTimeSlot = ( e ) => {
    e.preventDefault();
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
    api.timeSlots.add( newTimeSlot ).then( addedTimeSlot => {
      setTimeSlots( [
        addedTimeSlot,
        ...timeSlots,
      ] );
  } );
  };

  return <tr>

    { !! timeSlotSchema ? Object.keys( timeSlotSchema ).map( key => {
      if ( '_id' === key ) {
        return null;
      }
      console.log( 'debug timeSlotSchema', timeSlotSchema ); // debug
      console.log( 'debug key', key ); // debug
      switch( timeSlotSchema[key].type ) {
        case 'text':
            return <td
              className={ "timeSlot--" + key }
              colspan={ 'title' === key ? 2 : 1 }
            ><Input
              key={ key }
              field={ key }
              timeSlot={ timeSlot }
              editTimeSlot={ editTimeSlot }
              setEditTimeSlot={ setEditTimeSlot }
            /></td>;
        case 'date':
          return <td className={ "timeSlot--" + key }><DateInput
            key={ key }
            field={ key }
            timeSlot={ timeSlot }
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

      <td className={ "timeSlot--actions d-flex" }>
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
